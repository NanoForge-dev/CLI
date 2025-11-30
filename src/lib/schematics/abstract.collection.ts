import { getCwd } from "@utils/path";

import { AbstractRunner } from "../runner/abstract.runner";
import { Schematic } from "./nanoforge.collection";
import { SchematicOption } from "./schematic.option";

export abstract class AbstractCollection {
  protected constructor(
    protected collection: string,
    protected runner: AbstractRunner,
    protected cwd?: string,
  ) {}

  public async execute(
    name: string,
    options: SchematicOption[],
    flags?: string[],
    failSpinner?: () => void,
  ) {
    const command = this.buildCommandLine(name, options, flags);
    await this.runner.run(
      command,
      true,
      this.cwd ? getCwd(this.cwd) : undefined,
      undefined,
      undefined,
      failSpinner,
    );
  }

  public abstract getSchematics(): Schematic[];

  private buildCommandLine(
    name: string,
    options: SchematicOption[],
    flags: string[] = [],
  ): string[] {
    return [`${this.collection}:${name}`, ...flags, ...this.buildOptions(options)];
  }

  private buildOptions(options: SchematicOption[]): string[] {
    return options.reduce(
      (old: string[], option: SchematicOption) => [...old, ...option.toCommandString()],
      [],
    );
  }
}
