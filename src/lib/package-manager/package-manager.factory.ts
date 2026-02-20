import fs from "fs";
import { resolve } from "path";

import { RunnerFactory } from "@lib/runner";

import { PackageManager } from "./package-manager";
import { PM_CONFIGS } from "./package-manager-configs";
import { PackageManagerName } from "./package-manager-name";

const LOCK_FILE_MAP: Record<string, PackageManagerName> = {
  "bun.lock": PackageManagerName.BUN,
  "package-lock.json": PackageManagerName.NPM,
  "pnpm-lock.yaml": PackageManagerName.PNPM,
  "yarn.lock": PackageManagerName.YARN,
};

export class PackageManagerFactory {
  public static create(name: PackageManagerName | string): PackageManager {
    const config = PM_CONFIGS[name as PackageManagerName];
    if (!config) {
      throw new Error(`Package manager ${name} is not managed.`);
    }

    const runner = this.createRunner(name as PackageManagerName, config.binary);
    return new PackageManager(name, config.commands, runner);
  }

  public static async find(directory = "."): Promise<PackageManager> {
    const detected = await this.detectFromLockFile(directory);
    return this.create(detected);
  }

  private static createRunner(name: PackageManagerName, binary: string) {
    if (name === PackageManagerName.LOCAL_BUN) {
      return RunnerFactory.createLocal("bun");
    }
    return RunnerFactory.create(binary);
  }

  private static async detectFromLockFile(directory: string): Promise<PackageManagerName> {
    try {
      const files = await fs.promises.readdir(resolve(directory));
      for (const [lockFile, pmName] of Object.entries(LOCK_FILE_MAP)) {
        if (files.includes(lockFile)) return pmName;
      }
    } catch {
      // directory unreadable, fall through to default
    }
    return PackageManagerName.NPM;
  }
}
