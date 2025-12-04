import { AbstractCollection, SchematicOption } from "@lib/schematics";
import { Messages } from "@lib/ui";

import { getSpinner } from "~/action/common/spinner";

export const executeSchematic = async (
  name: string,
  collection: AbstractCollection,
  schematicName: string,
  options: object,
) => {
  const spinner = getSpinner(Messages.SCHEMATIC_IN_PROGRESS(name));
  spinner.start();
  await collection.execute(schematicName, mapSchematicOptions(options), undefined, () =>
    spinner.fail(Messages.SCHEMATIC_FAILED(name)),
  );
  spinner.succeed(Messages.SCHEMATIC_SUCCESS(name));
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
