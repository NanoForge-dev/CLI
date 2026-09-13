import { defaultClientConfig, defaultServerConfig } from "@nanoforge-dev/config";
import { watch } from "chokidar";
import { dirname, join, relative } from "node:path";

import {
  type ResolvedProject,
  type WorkspaceConfig,
  parseWorkspaceConfig,
  resolveProjects,
} from "@lib/config";
import {
  type Input,
  getDirectoryInput,
  getEditorInput,
  getStringInputWithDefault,
  getWatchInput,
} from "@lib/input";
import { PackageManagerFactory, PackageManagerName } from "@lib/package-manager";
import { Messages } from "@lib/ui";

import { copyFiles, resetFolder } from "@utils/files";
import { getCwd } from "@utils/path";
import { runSafe } from "@utils/run-safe";

import { AbstractAction, type HandleResult } from "../abstract.action";

interface BuildTarget {
  name: string;
  directory: string;
  entry: string;
  static?: string;
  output: string;
  platform: "browser" | "node";
}

export class BuildAction extends AbstractAction {
  protected startMessage = Messages.BUILD_START;
  protected successMessage = Messages.BUILD_SUCCESS;
  protected failureMessage = Messages.BUILD_FAILED;

  public async handle(_args: Input, options: Input): Promise<HandleResult> {
    const directory = getDirectoryInput(options);
    const workspaceConfig = await parseWorkspaceConfig(directory);
    const isEditor = getEditorInput(options);
    const isWatch = getWatchInput(options);

    const targets = this.resolveTargets(workspaceConfig, directory, options, isEditor);
    const results = await this.buildAll(targets, isWatch);

    if (isWatch) {
      return this.enterWatchMode();
    }

    return { success: results.every(Boolean) };
  }

  private resolveTargets(
    workspaceConfig: WorkspaceConfig,
    baseDirectory: string,
    options: Input,
    isEditor: boolean,
  ): BuildTarget[] {
    const projects = resolveProjects(workspaceConfig, baseDirectory);

    return projects.map((project) =>
      this.createTarget(project, baseDirectory, options, isEditor, projects.length > 1),
    );
  }

  private createTarget(
    project: ResolvedProject,
    baseDirectory: string,
    options: Input,
    isEditor: boolean,
    disambiguate: boolean,
  ): BuildTarget {
    const isClient = project.config.type === "client";
    const label = isClient ? "Client" : "Server";
    const relativePath = relative(baseDirectory, project.directory);
    const name = disambiguate && relativePath !== "" ? `${label} (${relativePath})` : label;
    const defaults = isClient ? defaultClientConfig : defaultServerConfig;

    const defaultEntry = isEditor
      ? (project.config.editor?.entryFile ?? defaults.editor.entryFile)
      : (project.config.entryFile ?? defaults.entryFile);

    return {
      name,
      directory: project.directory,
      entry: getStringInputWithDefault(
        options,
        isClient ? "clientEntry" : "serverEntry",
        defaultEntry,
      ),
      static: getStringInputWithDefault(
        options,
        isClient ? "clientStaticDir" : "serverStaticDir",
        project.config.dir?.assets ?? defaults.dir.assets,
      ),
      output: getStringInputWithDefault(
        options,
        isClient ? "clientOutDir" : "serverOutDir",
        project.config.out?.dir ?? defaults.out.dir,
      ),
      platform: isClient ? "browser" : "node",
    };
  }

  private async buildAll(targets: BuildTarget[], isWatch: boolean): Promise<boolean[]> {
    const results: boolean[] = [];
    for (const target of targets) {
      const result = await this.buildTarget(target, isWatch);
      results.push(result);
    }
    return results;
  }

  private async buildTarget(target: BuildTarget, isWatch: boolean): Promise<boolean> {
    const packageManager = PackageManagerFactory.create(PackageManagerName.LOCAL_BUN);

    const executeBuild = (rebuild = false) =>
      runSafe(() => {
        this.resetOut(target.output, target.directory);
        this.copyFiles(target, target.directory);
        return packageManager.build(
          target.name,
          target.directory,
          target.entry,
          target.output,
          ["--asset-naming", "[name].[ext]", "--target", target.platform],
          rebuild,
        );
      }, false);

    if (isWatch) {
      this.watchDirectory(target.directory, target.entry, () => executeBuild(true));
    }

    const result = await executeBuild();
    return result !== false;
  }

  private watchDirectory(directory: string, entry: string, onChange: () => void): void {
    const watchPath = dirname(join(getCwd(directory), entry));
    watch(watchPath).on("change", onChange);
  }

  private enterWatchMode(): HandleResult {
    console.info();
    console.info(Messages.BUILD_WATCH_START);
    console.info();
    return { keepAlive: true };
  }

  private resetOut(outDir: string, directory: string): void {
    resetFolder(getCwd(join(directory, outDir)));
  }

  private copyFiles(target: BuildTarget, directory: string): void {
    if (!target.static) return;
    const from = getCwd(join(directory, target.static));
    const to = getCwd(join(directory, target.output));
    copyFiles(from, to);
  }
}
