import { defaultClientConfig, defaultServerConfig } from "@nanoforge-dev/config";
import { watch } from "chokidar";
import { dirname, join, relative, resolve } from "node:path";

import {
  type ResolvedProject,
  type WorkspaceConfig,
  isPeerToPeer,
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

import { CLIError } from "@utils/errors";
import { copyFiles, getUnsafeOutDirReason, isWithin, resetFolder } from "@utils/files";
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
  sourcemap: boolean;
  /** Children of the output folder that a reset keeps: the browser server build in p2p. */
  keep?: string[];
}

/** Subfolder of the client output that holds the browser server build in p2p mode. */
const P2P_SERVER_DIR = "server";

/** Quiet time after the last file event before a rebuild: a multi-file save builds once. */
const REBUILD_DEBOUNCE_MS = 100;

/**
 * Debounced, serial rebuilds of one target: one build at a time, and the events seen during a
 * build queue at most one more.
 */
export const createRebuildQueue = (
  build: () => Promise<unknown>,
  delay = REBUILD_DEBOUNCE_MS,
): (() => void) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running = false;
  let pending = false;

  const run = async (): Promise<void> => {
    running = true;
    try {
      do {
        pending = false;
        await build();
      } while (pending);
    } finally {
      running = false;
    }
  };

  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (running) pending = true;
      else void run();
    }, delay);
  };
};

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
    const targets = projects.map((project) =>
      this.createTarget(project, baseDirectory, options, isEditor, projects.length > 1),
    );
    targets.forEach((target) => this.assertSafeOutput(target, target.directory));
    if (!isPeerToPeer(workspaceConfig)) return targets;

    const client = targets.find((target) => target.platform === "browser");
    if (!client) return targets;

    const browserServers = targets
      .filter((target) => target.platform === "node")
      .map((server) => ({
        ...server,
        name: `${server.name} (browser)`,
        output: relative(server.directory, join(client.directory, client.output, P2P_SERVER_DIR)),
        platform: "browser" as const,
      }));
    browserServers.forEach((target) => this.assertSafeOutput(target, client.directory));
    if (browserServers.length > 0) client.keep = [P2P_SERVER_DIR];
    return [...targets, ...browserServers];
  }

  /** Refuses, before anything is deleted, an output folder whose reset would destroy sources. */
  private assertSafeOutput(target: BuildTarget, root: string): void {
    const sources = target.static ? [target.entry, target.static] : [target.entry];
    const reason = getUnsafeOutDirReason(
      getCwd(root),
      getCwd(target.directory),
      target.output,
      sources,
    );
    if (reason)
      throw new CLIError(
        Messages.BUILD_UNSAFE_OUT_DIR(target.name, target.output, reason),
        Messages.BUILD_UNSAFE_OUT_DIR_SUGGESTION,
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
      sourcemap: isEditor,
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
        this.resetOut(target);
        this.copyFiles(target, target.directory);
        return packageManager.build(
          target.name,
          target.directory,
          target.entry,
          target.output,
          [
            "--asset-naming",
            "[name].[ext]",
            "--target",
            target.platform,
            ...(target.sourcemap ? ["--sourcemap=linked"] : []),
          ],
          rebuild,
        );
      }, false);

    const result = await executeBuild();
    // Watching starts after the first build, so the two never overlap.
    if (isWatch)
      this.watchTarget(
        target,
        createRebuildQueue(() => executeBuild(true)),
      );
    return result !== false;
  }

  /** Rebuilds on any file added, changed or deleted in the entry folder or the assets folder. */
  private watchTarget(target: BuildTarget, onChange: () => void): void {
    const directory = getCwd(target.directory);
    const output = resolve(directory, target.output);
    const paths = [dirname(resolve(directory, target.entry))];
    if (target.static) paths.push(resolve(directory, target.static));
    watch(paths, { ignoreInitial: true, ignored: (path) => isWithin(output, path) }).on("all", () =>
      onChange(),
    );
  }

  private enterWatchMode(): HandleResult {
    console.info();
    console.info(Messages.BUILD_WATCH_START);
    console.info();
    return { keepAlive: true };
  }

  private resetOut(target: BuildTarget): void {
    resetFolder(getCwd(join(target.directory, target.output)), target.keep);
  }

  private copyFiles(target: BuildTarget, directory: string): void {
    if (!target.static) return;
    const from = getCwd(join(directory, target.static));
    const to = getCwd(join(directory, target.output));
    copyFiles(from, to);
  }
}
