import ora from "ora";

import { Input, getDirectoryInput } from "@lib/input";
import { getNewInitFunctionsWithDefault } from "@lib/input/inputs/new/init-functions.input";
import { getNewInstallPackagesOrAsk } from "@lib/input/inputs/new/install-packages.input";
import { getNewLanguageInputOrAsk } from "@lib/input/inputs/new/language.input";
import { getNewNameInputOrAsk } from "@lib/input/inputs/new/name.input";
import { getNewPackageManagerInputOrAsk } from "@lib/input/inputs/new/package-manager.input";
import { getNewPathInput } from "@lib/input/inputs/new/path.input";
import { getNewServerOrAsk } from "@lib/input/inputs/new/server.input";
import { getNewStrictOrAsk } from "@lib/input/inputs/new/strict.input";
import {
  AbstractCollection,
  Collection,
  CollectionFactory,
  SchematicOption,
} from "@lib/schematics";
import { Messages } from "@lib/ui";

import { AbstractAction } from "../abstract.action";

interface NewOptions {
  name: string;
  directory?: string;
  packageManager: string;
  language: string;
  strict: boolean;
  server: boolean;
  initFunctions: boolean;
  installPackages: boolean;
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
    installPackages: await getNewInstallPackagesOrAsk(inputs),
  };
};

const generateApplicationFiles = async (values: NewOptions, directory: string) => {
  console.info();
  const collection: AbstractCollection = CollectionFactory.create(Collection.NANOFORGE, directory);

  console.info();
  console.info(Messages.NEW_SCHEMATICS_START);
  console.info();

  await executeSchematic("Application", collection, "application", {
    name: values.name,
    directory: values.directory,
    packageManager: values.packageManager,
    language: values.language,
    strict: values.strict,
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

const getSpinner = (message: string) =>
  ora({
    text: message,
  });

const executeSchematic = async (
  name: string,
  collection: AbstractCollection,
  schematicName: string,
  options: object,
) => {
  const spinner = getSpinner(Messages.NEW_SCHEMATIC_IN_PROGRESS(name));
  spinner.start();
  await collection.execute(schematicName, mapSchematicOptions(options), undefined, () =>
    spinner.fail(Messages.NEW_SCHEMATIC_FAILED(name)),
  );
  spinner.succeed(Messages.NEW_SCHEMATIC_SUCCESS(name));
};

const mapSchematicOptions = (inputs: object): SchematicOption[] => {
  return Object.entries(inputs).reduce((old, [key, value]) => {
    if (value === undefined) return old;
    return [
      ...old,
      new SchematicOption(key, typeof value === "object" ? mapSchematicOptions(value) : value),
    ];
  }, [] as SchematicOption[]);
};
