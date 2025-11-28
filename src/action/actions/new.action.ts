import ora from "ora";

import { Input, getDirectoryInput } from "@lib/input";
import { getNewLanguageInputOrAsk } from "@lib/input/inputs/new/language.input";
import { getNewNameInputOrAsk } from "@lib/input/inputs/new/name.input";
import { getNewPackageManagerInputOrAsk } from "@lib/input/inputs/new/package-manager.input";
import { getNewPathInput } from "@lib/input/inputs/new/path.input";
import { getStrictOrAsk } from "@lib/input/inputs/new/strict.input";
import {
  AbstractCollection,
  Collection,
  CollectionFactory,
  SchematicOption,
} from "@lib/schematics";
import { Messages } from "@lib/ui";

import { AbstractAction } from "../abstract.action";

export class NewAction extends AbstractAction {
  public async handle(_args: Input, options: Input) {
    console.info(Messages.NEW_START);

    try {
      const directory = getDirectoryInput(options);

      await generateApplicationFiles(options, directory);

      console.info();
      console.info(Messages.NEW_SUCCESS);
      process.exit(0);
    } catch {
      console.error(Messages.NEW_FAILED);
      process.exit(1);
    }
  }
}

const getSchemaValues = async (inputs: Input) => {
  return {
    name: await getNewNameInputOrAsk(inputs),
    directory: getNewPathInput(inputs),
    packageManager: await getNewPackageManagerInputOrAsk(inputs),
    language: await getNewLanguageInputOrAsk(inputs),
    strict: await getStrictOrAsk(inputs),
  };
};

const generateApplicationFiles = async (inputs: Input, directory: string) => {
  console.info();
  const collection: AbstractCollection = CollectionFactory.create(Collection.NANOFORGE, directory);
  const values = await getSchemaValues(inputs);
  console.info();
  console.info(Messages.NEW_SCHEMATICS_START);
  console.info();

  await executeSchematic(collection, "application", {
    name: values.name,
    directory: values.directory,
    packageManager: values.packageManager,
    language: values.language,
    strict: values.strict,
  });
  await executeSchematic(collection, "configuration", {
    name: values.name,
    directory: values.directory,
  });
};

const getSpinner = (message: string) =>
  ora({
    text: message,
  });

const executeSchematic = async (
  collection: AbstractCollection,
  schematicName: string,
  options: object,
) => {
  const spinner = getSpinner(Messages.NEW_SCHEMATIC_IN_PROGRESS(schematicName));
  spinner.start();
  await collection.execute(schematicName, mapSchematicOptions(options), undefined, () =>
    spinner.fail(Messages.NEW_SCHEMATIC_FAILED(schematicName)),
  );
  spinner.succeed(Messages.NEW_SCHEMATIC_SUCCESS(schematicName));
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
