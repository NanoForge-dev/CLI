import { type LocalBunRunner, Runner, RunnerFactory } from "@lib/runner";

import { AbstractPackageManager } from "../abstract.package-manager";
import { PackageManager } from "../package-manager";
import { type PackageManagerCommands } from "../package-manager-commands";

export class LocalBunPackageManager extends AbstractPackageManager {
  constructor() {
    super(RunnerFactory.create(Runner.LOCAL_BUN) as LocalBunRunner);
  }

  public get name() {
    return PackageManager.LOCAL_BUN.toUpperCase();
  }

  get cli(): PackageManagerCommands {
    return {
      install: "install",
      add: "add",
      update: "update",
      remove: "remove",
      run: "run",
      build: "build",
      runFile: "run",
      saveFlag: "--save",
      saveDevFlag: "--dev",
      silentFlag: "--silent",
    };
  }
}
