import { yellow } from "ansis";

import { Runner } from "./runner";
import { BunRunner } from "./runners/bun.runner";
import { NpmRunner } from "./runners/npm.runner";
import { PnpmRunner } from "./runners/pnpm.runner";
import { YarnRunner } from "./runners/yarn.runner";

export class RunnerFactory {
  public static create(runner: Runner) {
    switch (runner) {
      case Runner.NPM:
        return new NpmRunner();

      case Runner.YARN:
        return new YarnRunner();

      case Runner.PNPM:
        return new PnpmRunner();

      case Runner.BUN:
        return new BunRunner();

      default:
        console.info(yellow`[WARN] Unsupported runner: ${runner}`);
    }
  }
}
