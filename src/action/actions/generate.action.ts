import * as console from "node:console";

import { Config } from "@lib/config";
import { Input, getDirectoryInput } from "@lib/input";
import { AbstractCollection, Collection, CollectionFactory } from "@lib/schematics";
import { Messages } from "@lib/ui";

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
    console.info(Messages.NEW_START);

    try {
      const directory = getDirectoryInput(options);

      const config = await getConfig(options, directory);

      const values = await getSchemaValues(config);

      await generateFiles(values, directory);

      console.info();
      console.info(Messages.NEW_SUCCESS);
      process.exit(0);
    } catch (e) {
      console.error(Messages.NEW_FAILED);
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

const generateFiles = async (values: GenerateOptions, directory: string) => {
  console.info();
  const collection: AbstractCollection = CollectionFactory.create(Collection.NANOFORGE, directory);

  console.info();
  console.info(Messages.SCHEMATICS_START);
  console.info();

  await executeSchematic("Client main file", collection, "part-main", {
    name: values.name,
    part: "client",
    directory: values.directory,
    language: values.language,
    initFunctions: values.initFunctions,
  });

  if (values.server) {
    await executeSchematic("Server main file", collection, "part-main", {
      name: values.name,
      part: "server",
      directory: values.directory,
      language: values.language,
      initFunctions: values.initFunctions,
    });
  }
};
