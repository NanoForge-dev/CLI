import { join } from "node:path";

import { GitRunner } from "@lib/git/git-runner";
import {
  type Input,
  getDirectoryInput,
  getEditorInput,
  getNewDockerOrAsk,
  getNewLanguageInputOrAsk,
  getNewLintInput,
  getNewNameInputOrAsk,
  getNewPackageManagerInputOrAsk,
  getNewServerOrAsk,
  getNewSkipInstallOrAsk,
  getNewStrictOrAsk,
  getPathInput,
} from "@lib/input";
import { getNewGitRemoteInputOrAsk } from "@lib/input/inputs/new/git-remote.input";
import { getNewGitOrAsk } from "@lib/input/inputs/new/git.input";
import { PackageManagerFactory } from "@lib/package-manager";
import { Collection, CollectionFactory } from "@lib/schematics";
import { Messages } from "@lib/ui";

import { AbstractAction, type HandleResult } from "../abstract.action";
import { executeSchematic } from "../common/schematics";

interface NewValues {
  name: string;
  directory: string;
  packageManager: string;
  language: string;
  strict: boolean;
  multiplayer: boolean;
  skipInstall: boolean;
  docker: boolean;
  lint: boolean;
  editor: boolean;
  git: boolean;
  gitRemote: string | null;
}

export class NewAction extends AbstractAction {
  protected startMessage = Messages.NEW_START;
  protected successMessage = Messages.NEW_SUCCESS;
  protected failureMessage = Messages.NEW_FAILED;

  public async handle(_args: Input, options: Input): Promise<HandleResult> {
    const cwdDirectory = getDirectoryInput(options);
    const values = await this.collectValues(options);

    await this.scaffold(values, cwdDirectory);

    let res = true;

    const distDir = join(cwdDirectory, values.directory);

    if (!values.skipInstall) {
      res = await this.installDependencies(values.packageManager, distDir);
    }

    if (values.git) await this.setupGitRepository(values.gitRemote, distDir);

    return { success: res };
  }

  private async collectValues(inputs: Input): Promise<NewValues> {
    const values: Omit<NewValues, "directory" | "gitRemote"> = {
      name: await getNewNameInputOrAsk(inputs),
      packageManager: await getNewPackageManagerInputOrAsk(inputs),
      language: await getNewLanguageInputOrAsk(inputs),
      strict: await getNewStrictOrAsk(inputs),
      multiplayer: await getNewServerOrAsk(inputs),
      skipInstall: await getNewSkipInstallOrAsk(inputs),
      docker: await getNewDockerOrAsk(inputs),
      lint: getNewLintInput(inputs),
      editor: getEditorInput(inputs),
      git: await getNewGitOrAsk(inputs),
    };

    return {
      ...values,
      directory: getPathInput(inputs) ?? values.name,
      gitRemote: values.git ? (await getNewGitRemoteInputOrAsk(inputs)) || null : null,
    };
  }

  private async scaffold(values: NewValues, directory: string): Promise<void> {
    const collection = CollectionFactory.create(Collection.NANOFORGE, directory);

    console.info();
    console.info(Messages.NEW_GENERATION_START);
    console.info();

    if (values.multiplayer) {
      await this.generateWorkspace(collection, values);
      await this.generateClientProject(collection, values);
      await this.generateServerProject(collection, values);
    } else {
      await this.generateClientProject(collection, values);
    }
  }

  private generateWorkspace(
    collection: ReturnType<typeof CollectionFactory.create>,
    values: NewValues,
  ) {
    return executeSchematic("Workspace", collection, "workspace", {
      name: values.name,
      directory: values.directory,
      language: values.language,
      strict: values.strict,
      packageManager: values.packageManager,
      docker: values.docker,
    });
  }

  private generateClientProject(
    collection: ReturnType<typeof CollectionFactory.create>,
    values: NewValues,
  ) {
    return executeSchematic("Client project", collection, "project", {
      ...this.projectOptions(values, "client"),
      hasServer: values.multiplayer,
    });
  }

  private generateServerProject(
    collection: ReturnType<typeof CollectionFactory.create>,
    values: NewValues,
  ) {
    return executeSchematic(
      "Server project",
      collection,
      "project",
      this.projectOptions(values, "server"),
    );
  }

  private projectOptions(values: NewValues, part: "client" | "server") {
    return {
      part,
      workspaceName: values.multiplayer ? values.name : undefined,
      name: values.multiplayer ? part : values.name,
      directory: values.multiplayer ? join(values.directory, "apps", part) : values.directory,
      language: values.language,
      strict: values.strict,
      packageManager: values.packageManager,
      workspace: values.multiplayer,
      docker: values.docker,
      editor: values.editor,
    };
  }

  private async installDependencies(
    packageManagerName: string,
    directory: string,
  ): Promise<boolean> {
    const packageManager = PackageManagerFactory.create(packageManagerName);
    return await packageManager.install(directory);
  }

  private async setupGitRepository(gitRemote: string | null, dir: string): Promise<boolean> {
    const runner = new GitRunner();
    let res;

    res = await runner.init(dir);
    if (res && gitRemote) res = await runner.addRemote(dir, gitRemote);
    return res;
  }
}
