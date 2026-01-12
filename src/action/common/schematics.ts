import { watch } from "chokidar";

import { AbstractCollection, SchematicOption } from "@lib/schematics";
import { Messages } from "@lib/ui";

import { getSpinner } from "~/action/common/spinner";

export const executeSchematic = async (
  name: string,
  collection: AbstractCollection,
  schematicName: string,
  options: object,
  fileToWatch?: string,
) => {
  const execute = async (watch: boolean = false) => {
    const spinner = getSpinner(
      (watch ? Messages.SCHEMATIC_WATCH_IN_PROGRESS : Messages.SCHEMATIC_IN_PROGRESS)(name),
    );
    spinner.start();
    await collection.execute(schematicName, mapSchematicOptions(options), undefined, () =>
      spinner.fail(Messages.SCHEMATIC_FAILED(name)),
    );
    spinner.succeed(Messages.SCHEMATIC_SUCCESS(name));
  };

  if (fileToWatch) watch(fileToWatch).on("change", () => execute(true));

  return await execute();
};

export const mapSchematicOptions = (inputs: object): SchematicOption[] => {
  return Object.entries(inputs).reduce((old, [key, value]) => {
    if (value === undefined) return old;
    return [
      ...old,
      new SchematicOption(key, typeof value === "object" ? mapSchematicOptions(value) : value),
    ];
  }, [] as SchematicOption[]);
};
