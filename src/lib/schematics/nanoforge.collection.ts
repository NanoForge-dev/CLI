import { type Runner } from "@lib/runner/runner";

import { CLIError } from "@utils/errors";

import { AbstractCollection } from "./abstract.collection";
import { type SchematicOption } from "./schematic.option";

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
    {
      name: "part-base",
      alias: "base",
      description: "Generate a NanoForge Part Base",
    },
    {
      name: "part-main",
      alias: "main",
      description: "Generate a NanoForge Part Main file",
    },
    {
      name: "docker",
      alias: "docker",
      description: "Generate a Dockerfile for the application",
    },
    {
      name: "component",
      alias: "component",
      description: "Generate a Component for an application",
    },
    {
      name: "system",
      alias: "system",
      description: "Generate a System for an application",
    },
  ];

  constructor(runner: Runner, cwd?: string) {
    super("@nanoforge-dev/schematics", runner, cwd);
  }

  public override async execute(
    name: string,
    options: SchematicOption[],
    flags?: string[],
    failSpinner?: () => void,
  ) {
    const schematic: string = this.validate(name);
    await super.execute(schematic, options, flags, failSpinner);
  }

  public getSchematics(): Schematic[] {
    return NanoforgeCollection.schematics;
  }

  private validate(name: string) {
    const schematic = NanoforgeCollection.schematics.find(
      (s) => s.name === name || s.alias === name,
    );

    if (schematic === undefined || schematic === null) {
      throw new CLIError(
        `Invalid schematic "${name}". Please, ensure that "${name}" exists in this collection.`,
      );
    }
    return schematic.name;
  }
}
