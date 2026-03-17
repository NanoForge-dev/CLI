import { watch } from "chokidar";
import { dirname, join } from "node:path";

import { type Config } from "@lib/config";
import {
  type Input,
  getDirectoryInput,
  getStringInputWithDefault,
  getWatchInput,
} from "@lib/input";
import { PackageManagerFactory, PackageManagerName } from "@lib/package-manager";
import { Messages } from "@lib/ui";

import { getCwd } from "@utils/path";
import { runSafe } from "@utils/run-safe";

import { getConfig } from "~/action/common/config";

import { AbstractAction, type HandleResult } from "../abstract.action";

interface BuildTarget {
  name: string;
  entry: string;
  output: string;
  platform: "browser" | "node";
}

export class BuildAction extends AbstractAction {
  protected startMessage = Messages.BUILD_START;
  protected successMessage = Messages.BUILD_SUCCESS;
  protected failureMessage = Messages.BUILD_FAILED;

  public async handle(_args: Input, options: Input): Promise<HandleResult> {
    const directory = getDirectoryInput(options);
    const config = await getConfig(options, directory);
    const isWatch = getWatchInput(options);

    const targets = this.resolveTargets(config, options);
    const results = await this.buildAll(targets, directory, isWatch);

    if (isWatch) {
      return this.enterWatchMode();
    }

    return { success: results.every(Boolean) };
  }

  private resolveTargets(config: Config, options: Input): BuildTarget[] {
    const targets: BuildTarget[] = [];

    if (config.client.enable)
      targets.push(
        this.createTarget(
          "Client",

          "browser",
          getStringInputWithDefault(options, "clientEntry", config.client.build.entry),
          getStringInputWithDefault(options, "clientOutDir", config.client.outDir),
        ),
      );
    if (config.server.enable)
      targets.push(
        this.createTarget(
          "Server",
          "node",
          getStringInputWithDefault(options, "serverEntry", config.server.build.entry),
          getStringInputWithDefault(options, "serverOutDir", config.server.outDir),
        ),
      );

    return targets;
  }

  private createTarget(
    name: string,
    platform: "browser" | "node",
    entryFile: string,
    outDir: string,
  ): BuildTarget {
    return {
      name,
      entry: entryFile,
      output: outDir,
      platform,
    };
  }

  private async buildAll(
    targets: BuildTarget[],
    directory: string,
    isWatch: boolean,
  ): Promise<boolean[]> {
    const results: boolean[] = [];
    for (const target of targets) {
      const result = await this.buildTarget(target, directory, isWatch);
      results.push(result);
    }
    return results;
  }

  private async buildTarget(
    target: BuildTarget,
    directory: string,
    isWatch: boolean,
  ): Promise<boolean> {
    const packageManager = PackageManagerFactory.create(PackageManagerName.LOCAL_BUN);

    const executeBuild = (rebuild = false) =>
      runSafe(
        () =>
          packageManager.build(
            target.name,
            directory,
            target.entry,
            target.output,
            ["--asset-naming", "[name].[ext]", "--target", target.platform],
            rebuild,
          ),
        false,
      );

    if (isWatch) {
      this.watchDirectory(directory, target.entry, () => executeBuild(true));
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
}
