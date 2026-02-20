import { watch } from "chokidar";

import { type AbstractCollection, SchematicOption } from "@lib/schematics";
import { Messages } from "@lib/ui";
import { getSpinner } from "@lib/ui/spinner";

export const executeSchematic = async (
  name: string,
  collection: AbstractCollection,
  schematicName: string,
  options: object,
  fileToWatch?: string,
): Promise<void> => {
  const execute = async (isRebuild = false) => {
    const message = isRebuild
      ? Messages.SCHEMATIC_WATCH_IN_PROGRESS(name)
      : Messages.SCHEMATIC_IN_PROGRESS(name);
    const spinner = getSpinner(message);
    spinner.start();

    await collection.execute(schematicName, mapSchematicOptions(options), undefined, () =>
      spinner.fail(Messages.SCHEMATIC_FAILED(name)),
    );

    spinner.succeed(Messages.SCHEMATIC_SUCCESS(name));
  };

  if (fileToWatch) {
    watch(fileToWatch).on("change", () => execute(true));
  }

  await execute();
};

export const mapSchematicOptions = (inputs: object): SchematicOption[] => {
  return Object.entries(inputs).reduce((acc: SchematicOption[], [key, value]) => {
    if (value === undefined) return acc;

    const mapped =
      typeof value === "object"
        ? new SchematicOption(key, mapSchematicOptions(value))
        : new SchematicOption(key, value);

    acc.push(mapped);
    return acc;
  }, []);
};
