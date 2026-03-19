import { join } from "node:path";

import {
  type Input,
  getDirectoryInput,
  getEditorInput,
  getNewDockerOrAsk,
  getNewInitFunctionsWithDefault,
  getNewLanguageInputOrAsk,
  getNewLintInput,
  getNewNameInputOrAsk,
  getNewPackageManagerInputOrAsk,
  getNewPathInput,
  getNewServerOrAsk,
  getNewSkipInstallOrAsk,
  getNewStrictOrAsk,
} from "@lib/input";
import { PackageManagerFactory } from "@lib/package-manager";
import { Collection, CollectionFactory } from "@lib/schematics";
import { Messages } from "@lib/ui";

import { AbstractAction, type HandleResult } from "../abstract.action";
import { executeSchematic } from "../common/schematics";

interface NewValues {
  name: string;
  directory?: string;
  packageManager: string;
  language: string;
  strict: boolean;
  server: boolean;
  initFunctions: boolean;
  skipInstall: boolean;
  docker: boolean;
  lint: boolean;
  editor: boolean;
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

    if (!values.skipInstall) {
      res = await this.installDependencies(
        values.packageManager,
        join(cwdDirectory, values.directory ?? values.name),
      );
    }

    return { success: res };
  }

  private async collectValues(inputs: Input): Promise<NewValues> {
    return {
      name: await getNewNameInputOrAsk(inputs),
      directory: getNewPathInput(inputs),
      packageManager: await getNewPackageManagerInputOrAsk(inputs),
      language: await getNewLanguageInputOrAsk(inputs),
      strict: await getNewStrictOrAsk(inputs),
      server: await getNewServerOrAsk(inputs),
      initFunctions: getNewInitFunctionsWithDefault(inputs),
      skipInstall: await getNewSkipInstallOrAsk(inputs),
      docker: await getNewDockerOrAsk(inputs),
      lint: getNewLintInput(inputs),
      editor: getEditorInput(inputs),
    };
  }

  private async scaffold(values: NewValues, directory: string): Promise<void> {
    const collection = CollectionFactory.create(Collection.NANOFORGE, directory);

    console.info(Messages.SCHEMATICS_START);
    console.info();

    await this.generateApplication(collection, values);
    await this.generateConfiguration(collection, values);
    await this.generateClientParts(collection, values);
    await this.generateDocker(collection, values);

    if (values.server) {
      await this.generateServerParts(collection, values);
    }
  }

  private generateApplication(
    collection: ReturnType<typeof CollectionFactory.create>,
    values: NewValues,
  ) {
    return executeSchematic("Application", collection, "application", {
      name: values.name,
      directory: values.directory,
      packageManager: values.packageManager,
      language: values.language,
      strict: values.strict,
      server: values.server,
      lint: values.lint,
      editor: values.editor,
    });
  }

  private generateConfiguration(
    collection: ReturnType<typeof CollectionFactory.create>,
    values: NewValues,
  ) {
    return executeSchematic("Configuration", collection, "configuration", {
      name: values.name,
      directory: values.directory ?? values.name,
      server: values.server,
      language: values.language,
      initFunctions: values.initFunctions,
    });
  }

  private async generateClientParts(
    collection: ReturnType<typeof CollectionFactory.create>,
    values: NewValues,
  ) {
    const partOptions = this.partOptions(values, "client");

    await executeSchematic("Client base", collection, "part-base", {
      ...partOptions,
      server: values.server,
    });
    await executeSchematic("Client main file", collection, "part-main", {
      ...partOptions,
    });
  }

  private async generateServerParts(
    collection: ReturnType<typeof CollectionFactory.create>,
    values: NewValues,
  ) {
    const partOptions = this.partOptions(values, "server");

    await executeSchematic("Server base", collection, "part-base", {
      ...partOptions,
      server: values.server,
    });
    await executeSchematic("Server main file", collection, "part-main", {
      ...partOptions,
    });
  }

  private async generateDocker(
    collection: ReturnType<typeof CollectionFactory.create>,
    values: NewValues,
  ) {
    await executeSchematic("Docker", collection, "docker", {
      directory: values.directory ?? values.name,
      packageManager: values.packageManager,
    });
  }

  private partOptions(values: NewValues, part: "client" | "server") {
    return {
      part,
      directory: values.directory ?? values.name,
      language: values.language,
      initFunctions: values.initFunctions,
    };
  }

  private async installDependencies(
    packageManagerName: string,
    directory: string,
  ): Promise<boolean> {
    const packageManager = PackageManagerFactory.create(packageManagerName);
    return await packageManager.install(directory);
  }
}
