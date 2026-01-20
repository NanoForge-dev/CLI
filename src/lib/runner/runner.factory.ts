import { yellow } from "ansis";

import { Runner } from "./runner";
import { BunRunner } from "./runners/bun.runner";
import { LocalBunRunner } from "./runners/local-bun.runner";
import { NpmRunner } from "./runners/npm.runner";
import { PnpmRunner } from "./runners/pnpm.runner";
import { SchematicRunner } from "./runners/schematic.runner";
import { YarnRunner } from "./runners/yarn.runner";

export class RunnerFactory {
  public static create(runner: Runner) {
    switch (runner) {
      case Runner.BUN:
        return new BunRunner();
      case Runner.LOCAL_BUN:
        return new LocalBunRunner();
      case Runner.NPM:
        return new NpmRunner();
      case Runner.PNPM:
        return new PnpmRunner();
      case Runner.SCHEMATIC:
        return new SchematicRunner();
      case Runner.YARN:
        return new YarnRunner();

      default:
        console.info(yellow`[WARN] Unsupported runner: ${runner}`);
        throw Error(`Unsupported runner: ${runner}`);
    }
  }
}
