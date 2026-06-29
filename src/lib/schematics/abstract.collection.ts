import { type Runner } from "@lib/runner/runner";

import { getCwd } from "@utils/path";
import { getModulePath } from "@utils/path";

import { type Schematic } from "./nanoforge.collection";
import { type SchematicOption } from "./schematic.option";

export abstract class AbstractCollection {
  protected constructor(
    protected collection: string,
    protected runner: Runner,
    protected cwd?: string,
  ) {}

  public async execute(
    name: string,
    options: SchematicOption[],
    flags?: string[],
    onFail?: () => void,
  ): Promise<void> {
    const command = this.buildCommandLine(name, options, flags);
    await this.runner.run(command, {
      collect: true,
      cwd: this.cwd ? getCwd(this.cwd) : undefined,
      onFail,
    });
  }

  public abstract getSchematics(): Schematic[];

  private buildCommandLine(
    name: string,
    options: SchematicOption[],
    flags: string[] = ["--no-dry-run", "--allow-private", "--no-debug"],
  ): string[] {
    return [
      ...flags,
      `'${getModulePath(this.collection + "/collection.json")}:${name}'`,
      ...this.serializeOptions(options),
    ];
  }

  private serializeOptions(options: SchematicOption[]): string[] {
    return options.flatMap((option) => option.toCommandString());
  }
}
