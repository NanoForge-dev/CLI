import { yellow } from "ansis";

import { Runner } from "./runner";
import { BunRunner } from "./runners/bun.runner";

export class RunnerFactory {
  public static create(runner: Runner) {
    switch (runner) {
      case Runner.BUN:
        return new BunRunner();

      default:
        console.info(yellow`[WARN] Unsupported runner: ${runner}`);
    }
  }
}
