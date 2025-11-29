import * as ansis from "ansis";

import { Input } from "../../command";
import { getConfig } from "../../lib/config/config-loader";
import { BuildConfig } from "../../lib/config/config.type";
import {
  PackageManager,
  PackageManagerFactory,
} from "../../lib/package-manager";
import { Messages } from "../../lib/ui";
import { AbstractAction } from "../abstract.action";
import { getDirectoryInput } from "../common/inputs";

interface BuildPart {
  entry: string;
  output: string;
}

export class BuildAction extends AbstractAction {
  public async handle(args: Input, options: Input) {
    console.info(Messages.BUILD_START);
    console.info();

    const directory = getDirectoryInput(options);

    const config = await getConfig(
      directory,
      options.get("config")?.value as string | undefined,
    );

    const client = getPart(
      config.client.build,
      options.get("clientDirectory")?.value as string | undefined,
    );
    let res = await buildPart("Client", client, directory);

    if (config.server.enable) {
      const server = getPart(
        config.server.build,
        options.get("serverDirectory")?.value as string | undefined,
      );
      res = (await buildPart("Server", server, directory)) ? res : false;
    }

    console.info();
    if (!res) console.info(Messages.BUILD_FAILED);
    else console.info(Messages.BUILD_SUCCESS);

    process.exit(0);
  }
}

const getPart = (
  config: BuildConfig,
  directoryOption: string | undefined,
): BuildPart => {
  return {
    entry: config.entryFile,
    output: directoryOption || config.outDir,
  };
};

const buildPart = async (name: string, part: BuildPart, directory: string) => {
  const packageManagerName = PackageManager.BUN;

  try {
    const packageManager = PackageManagerFactory.create(packageManagerName);
    return await packageManager.build(
      name,
      directory,
      part.entry,
      part.output,
      ["--asset-naming", "[name].[ext]"],
    );
  } catch (error) {
    if (error && error.message) {
      console.error(ansis.red(error.message));
    }
    return false;
  }
};
