import * as console from "node:console";
import { join } from "path";

import { Config } from "@lib/config";
import { Input, getDirectoryInput, getWatchInput } from "@lib/input";
import { AbstractCollection, Collection, CollectionFactory } from "@lib/schematics";
import { Messages } from "@lib/ui";

import { getCwd } from "@utils/path";

import { getConfig } from "~/action/common/config";

import { AbstractAction } from "../abstract.action";
import { executeSchematic } from "../common/schematics";

interface GenerateOptions {
  name: string;
  directory: string;
  language: string;
  server: boolean;
  initFunctions: boolean;
}

export class GenerateAction extends AbstractAction {
  public async handle(_args: Input, options: Input) {
    console.info(Messages.GENERATE_START);
    console.info();

    try {
      const directory = getDirectoryInput(options);

      const config = await getConfig(options, directory);
      const watch = getWatchInput(options);

      const values = await getSchemaValues(config);

      await generateFiles(values, directory, watch);

      console.info();

      if (watch) {
        console.info(Messages.GENERATE_WATCH_START);
        console.info();
        return;
      }

      console.info(Messages.GENERATE_SUCCESS);
      process.exit(0);
    } catch (e) {
      console.error(Messages.GENERATE_FAILED);
      console.error(e);
      process.exit(1);
    }
  }
}

const getSchemaValues = async (config: Config): Promise<GenerateOptions> => {
  return {
    name: config.name,
    directory: ".",
    language: config.language,
    server: config.server.enable,
    initFunctions: config.initFunctions,
  };
};

const generateFiles = async (values: GenerateOptions, directory: string, watch?: boolean) => {
  const collection: AbstractCollection = CollectionFactory.create(Collection.NANOFORGE, directory);

  console.info(Messages.SCHEMATICS_START);
  console.info();

  await executeSchematic(
    "Client main file",
    collection,
    "part-main",
    {
      name: values.name,
      part: "client",
      directory: values.directory,
      language: values.language,
      initFunctions: values.initFunctions,
    },
    watch ? join(getCwd(directory), values.directory, ".nanoforge", "client.save.json") : undefined,
  );

  if (values.server) {
    await executeSchematic(
      "Server main file",
      collection,
      "part-main",
      {
        name: values.name,
        part: "server",
        directory: values.directory,
        language: values.language,
        initFunctions: values.initFunctions,
      },
      join(getCwd(directory), values.directory, ".nanoforge", "server.save.json"),
    );
  }
};
