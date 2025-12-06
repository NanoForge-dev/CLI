import * as ansis from "ansis";
import * as process from "node:process";

import { BuildConfig } from "@lib/config";
import { Input, getDirectoryInput } from "@lib/input";
import { PackageManager, PackageManagerFactory } from "@lib/package-manager";
import { Messages } from "@lib/ui";

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

      const client = getPart(
        config.client.build,
        options.get("clientDirectory")?.value as string | undefined,
        "client",
      );
      let res = await buildPart("Client", client, directory);

      if (config.server.enable) {
        const server = getPart(
          config.server.build,
          options.get("serverDirectory")?.value as string | undefined,
          "server",
        );
        res = (await buildPart("Server", server, directory)) ? res : false;
      }

      console.info();
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

const buildPart = async (name: string, part: BuildPart, directory: string) => {
  const packageManagerName = PackageManager.BUN;

  try {
    const packageManager = PackageManagerFactory.create(packageManagerName);
    return await packageManager.build(name, directory, part.entry, part.output, [
      "--asset-naming",
      "[name].[ext]",
      "--target",
      part.target === "client" ? "browser" : "node",
    ]);
  } catch (error: any) {
    if (error && error.message) {
      console.error(ansis.red(error.message));
    }
    return false;
  }
};
