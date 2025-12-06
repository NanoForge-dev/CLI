import { Input, getDirectoryInput } from "@lib/input";
import { getNewInitFunctionsWithDefault } from "@lib/input/inputs/new/init-functions.input";
import { getNewLanguageInputOrAsk } from "@lib/input/inputs/new/language.input";
import { getNewNameInputOrAsk } from "@lib/input/inputs/new/name.input";
import { getNewPackageManagerInputOrAsk } from "@lib/input/inputs/new/package-manager.input";
import { getNewPathInput } from "@lib/input/inputs/new/path.input";
import { getNewServerOrAsk } from "@lib/input/inputs/new/server.input";
import { getNewSkipInstallOrAsk } from "@lib/input/inputs/new/skip-install.input";
import { getNewStrictOrAsk } from "@lib/input/inputs/new/strict.input";
import { AbstractCollection, Collection, CollectionFactory } from "@lib/schematics";
import { Messages } from "@lib/ui";

import { AbstractAction } from "../abstract.action";
import { executeSchematic } from "../common/schematics";

interface NewOptions {
  name: string;
  directory?: string;
  packageManager: string;
  language: string;
  strict: boolean;
  server: boolean;
  initFunctions: boolean;
  skipInstall: boolean;
}

export class NewAction extends AbstractAction {
  public async handle(_args: Input, options: Input) {
    console.info(Messages.NEW_START);

    try {
      const directory = getDirectoryInput(options);

      const values = await getSchemaValues(options);

      await generateApplicationFiles(values, directory);

      console.info();
      console.info(Messages.NEW_SUCCESS);
      process.exit(0);
    } catch {
      console.error(Messages.NEW_FAILED);
      process.exit(1);
    }
  }
}

const getSchemaValues = async (inputs: Input): Promise<NewOptions> => {
  return {
    name: await getNewNameInputOrAsk(inputs),
    directory: getNewPathInput(inputs),
    packageManager: await getNewPackageManagerInputOrAsk(inputs),
    language: await getNewLanguageInputOrAsk(inputs),
    strict: await getNewStrictOrAsk(inputs),
    server: await getNewServerOrAsk(inputs),
    initFunctions: getNewInitFunctionsWithDefault(inputs),
    skipInstall: await getNewSkipInstallOrAsk(inputs),
  };
};

const generateApplicationFiles = async (values: NewOptions, directory: string) => {
  console.info();
  const collection: AbstractCollection = CollectionFactory.create(Collection.NANOFORGE, directory);

  console.info();
  console.info(Messages.SCHEMATICS_START);
  console.info();

  await executeSchematic("Application", collection, "application", {
    name: values.name,
    directory: values.directory,
    packageManager: values.packageManager,
    language: values.language,
    strict: values.strict,
    server: values.server,
  });
  await executeSchematic("Configuration", collection, "configuration", {
    name: values.name,
    directory: values.directory,
    server: values.server,
  });
  await executeSchematic("Base Client", collection, "part-base", {
    name: values.name,
    part: "client",
    directory: values.directory,
    language: values.language,
    initFunctions: values.initFunctions,
  });
  await executeSchematic("Client main file", collection, "part-main", {
    name: values.name,
    part: "client",
    directory: values.directory,
    language: values.language,
    initFunctions: values.initFunctions,
  });

  if (values.server) {
    await executeSchematic("Base server", collection, "part-base", {
      name: values.name,
      part: "server",
      directory: values.directory,
      language: values.language,
      initFunctions: values.initFunctions,
    });
    await executeSchematic("Server main file", collection, "part-main", {
      name: values.name,
      part: "server",
      directory: values.directory,
      language: values.language,
      initFunctions: values.initFunctions,
    });
  }
};
