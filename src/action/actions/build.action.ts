import * as ansis from "ansis";
import { watch } from "chokidar";
import * as console from "node:console";
import { dirname, join } from "path";

import { type BuildConfig } from "@lib/config";
import { type Input, getDirectoryInput } from "@lib/input";
import { getWatchInput } from "@lib/input";
import { PackageManager, PackageManagerFactory } from "@lib/package-manager";
import { Messages } from "@lib/ui";

import { getCwd } from "@utils/path";

import { getConfig } from "~/action/common/config";

import { AbstractAction } from "../abstract.action";

interface BuildPart {
  entry: string;
  output: string;
  target: "client" | "server";
}

export class BuildAction extends AbstractAction {
  public async handle(_args: Input, options: Input) {
    console.info(Messages.BUILD_START);
    console.info();

    try {
      const directory = getDirectoryInput(options);
      const config = await getConfig(options, directory);
      const watch = getWatchInput(options);

      const client = getPart(
        config.client.build,
        options.get("clientDirectory")?.value as string | undefined,
        "client",
      );
      let res = await buildPart("Client", client, directory, { watch });

      if (config.server.enable) {
        const server = getPart(
          config.server.build,
          options.get("serverDirectory")?.value as string | undefined,
          "server",
        );
        res = (await buildPart("Server", server, directory, { watch })) ? res : false;
      }

      console.info();

      if (watch) {
        console.info(Messages.BUILD_WATCH_START);
        console.info();
        return;
      }

      if (!res) console.info(Messages.BUILD_FAILED);
      else console.info(Messages.BUILD_SUCCESS);
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
}

const getPart = (
  config: BuildConfig,
  directoryOption: string | undefined,
  target: "client" | "server",
): BuildPart => {
  return {
    entry: config.entryFile,
    output: directoryOption || config.outDir,
    target: target,
  };
};

const buildPart = async (
  name: string,
  part: BuildPart,
  directory: string,
  options?: { watch?: boolean },
) => {
  const packageManagerName = PackageManager.LOCAL_BUN;

  const packageManager = PackageManagerFactory.create(packageManagerName);

  const build = async (watch = false) => {
    try {
      return await packageManager.build(
        name,
        directory,
        part.entry,
        part.output,
        [
          "--asset-naming",
          "[name].[ext]",
          "--target",
          part.target === "client" ? "browser" : "node",
        ],
        watch,
      );
    } catch (error: any) {
      if (error && error.message) {
        console.error(ansis.red(error.message));
      }
      return false;
    }
  };

  if (options?.watch)
    watch(dirname(join(getCwd(directory), part.entry))).on("change", () => build(true));

  return await build();
};
