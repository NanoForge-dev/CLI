import { yellow } from "ansis";

import { Runner } from "./runner";
import { BunRunner } from "./runners/bun.runner";
import { SchematicRunner } from "./runners/schematic.runner";

export class RunnerFactory {
  public static create(runner: Runner) {
    switch (runner) {
      case Runner.BUN:
        return new BunRunner();
      case Runner.SCHEMATIC:
        return new SchematicRunner();

      default:
        console.info(yellow`[WARN] Unsupported runner: ${runner}`);
        throw Error(`Unsupported runner: ${runner}`);
    }
  }
}
