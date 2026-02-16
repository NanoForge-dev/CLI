import { type NpmRunner, Runner, RunnerFactory } from "@lib/runner";

import { AbstractPackageManager } from "../abstract.package-manager";
import { PackageManager } from "../package-manager";
import { type PackageManagerCommands } from "../package-manager-commands";

export class NpmPackageManager extends AbstractPackageManager {
  constructor() {
    super(RunnerFactory.create(Runner.NPM) as NpmRunner);
  }

  public get name() {
    return PackageManager.NPM.toUpperCase();
  }

  get cli(): PackageManagerCommands {
    return {
      install: "install",
      add: "install",
      update: "update",
      remove: "uninstall",
      exec: "exec",
      run: "run",
      saveFlag: "--save",
      saveDevFlag: "--save-dev",
      silentFlag: "--silent",
    };
  }
}
