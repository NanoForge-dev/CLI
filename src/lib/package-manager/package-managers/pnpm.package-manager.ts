import { type PnpmRunner, Runner, RunnerFactory } from "@lib/runner";

import { AbstractPackageManager } from "../abstract.package-manager";
import { PackageManager } from "../package-manager";
import { type PackageManagerCommands } from "../package-manager-commands";

export class PnpmPackageManager extends AbstractPackageManager {
  constructor() {
    super(RunnerFactory.create(Runner.PNPM) as PnpmRunner);
  }

  public get name() {
    return PackageManager.PNPM.toUpperCase();
  }

  get cli(): PackageManagerCommands {
    return {
      install: "install",
      add: "add",
      update: "update",
      remove: "remove",
      run: "run",
      saveFlag: "-P",
      saveDevFlag: "-D",
      silentFlag: "--silent",
    };
  }
}
