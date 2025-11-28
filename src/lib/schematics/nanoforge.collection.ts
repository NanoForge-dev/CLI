import { AbstractRunner } from "../runner/abstract.runner";
import { AbstractCollection } from "./abstract.collection";
import { SchematicOption } from "./schematic.option";

export interface Schematic {
  name: string;
  alias: string;
  description: string;
}

export class NanoforgeCollection extends AbstractCollection {
  private static schematics: Schematic[] = [
    {
      name: "application",
      alias: "application",
      description: "Generate a new application",
    },
    {
      name: "configuration",
      alias: "config",
      description: "Generate a CLI configuration file",
    },
  ];

  constructor(runner: AbstractRunner, cwd?: string) {
    super("@nanoforge-dev/schematics", runner, cwd);
  }

  public override async execute(
    name: string,
    options: SchematicOption[],
    extraFlags?: string,
    failSpinner?: () => void,
  ) {
    const schematic: string = this.validate(name);
    await super.execute(schematic, options, extraFlags, failSpinner);
  }

  public getSchematics(): Schematic[] {
    return NanoforgeCollection.schematics;
  }

  private validate(name: string) {
    const schematic = NanoforgeCollection.schematics.find(
      (s) => s.name === name || s.alias === name,
    );

    if (schematic === undefined || schematic === null) {
      throw new Error(
        `Invalid schematic "${name}". Please, ensure that "${name}" exists in this collection.`,
      );
    }
    return schematic.name;
  }
}
