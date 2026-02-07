import { Runner, RunnerFactory, type YarnRunner } from "@lib/runner";

import { AbstractPackageManager } from "../abstract.package-manager";
import { PackageManager } from "../package-manager";
import { type PackageManagerCommands } from "../package-manager-commands";

export class YarnPackageManager extends AbstractPackageManager {
  constructor() {
    super(RunnerFactory.create(Runner.YARN) as YarnRunner);
  }

  public get name() {
    return PackageManager.YARN.toUpperCase();
  }

  get cli(): PackageManagerCommands {
    return {
      install: "install",
      add: "add",
      update: "update",
      remove: "remove",
      run: "run",
      saveFlag: "",
      saveDevFlag: "-D",
      silentFlag: "--silent",
    };
  }
}
