import * as ansis from "ansis";

import { Input } from "../../command";
import { getConfig } from "../../lib/config/config-loader";
import { BuildPartConfig } from "../../lib/config/config.type";
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
      config.build.client,
      options.get("clientDirectory")?.value as string | undefined,
      ".nanoforge/client",
    );
    const server = getPart(
      config.build.server,
      options.get("serverDirectory")?.value as string | undefined,
      ".nanoforge/server",
    );

    let res = true;

    if (client)
      res = (await buildPart("Client", client, directory)) ? res : false;
    if (server)
      res = (await buildPart("Server", server, directory)) ? res : false;
    if (!client && !server) console.info(Messages.BUILD_NOTHING);
    else {
      console.info();
      if (!res) console.info(Messages.BUILD_FAILED);
      else console.info(Messages.BUILD_SUCCESS);
    }

    process.exit(0);
  }
}

const getPart = (
  config: BuildPartConfig,
  directoryOption: string | undefined,
  defaultOutput: string,
): BuildPart | undefined => {
  if (!config || !config.entryFile) return undefined;
  return {
    entry: config.entryFile,
    output: directoryOption || config.outDir || defaultOutput,
  };
};

const buildPart = async (name: string, part: BuildPart, directory: string) => {
  const packageManagerName = PackageManager.BUN;

  try {
    const packageManager = PackageManagerFactory.create(packageManagerName);
    return await packageManager.build(name, directory, part.entry, part.output);
  } catch (error) {
    if (error && error.message) {
      console.error(ansis.red(error.message));
    }
    return false;
  }
};
