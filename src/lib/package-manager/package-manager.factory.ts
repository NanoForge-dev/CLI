import * as fs from "fs";

import { AbstractPackageManager } from "./abstract.package-manager";
import { PackageManager } from "./package-manager";
import { BunPackageManager } from "./package-managers/bun.package-manager";
import { NpmPackageManager } from "./package-managers/npm.package-manager";
import { PnpmPackageManager } from "./package-managers/pnpm.package-manager";
import { YarnPackageManager } from "./package-managers/yarn.package-manager";

export class PackageManagerFactory {
  public static create(name: PackageManager | string): AbstractPackageManager {
    switch (name) {
      case PackageManager.NPM:
        return new NpmPackageManager();
      case PackageManager.YARN:
        return new YarnPackageManager();
      case PackageManager.PNPM:
        return new PnpmPackageManager();
      case PackageManager.BUN:
        return new BunPackageManager();
      default:
        throw new Error(`Package manager ${name} is not managed.`);
    }
  }

  public static async find(): Promise<AbstractPackageManager> {
    const DEFAULT_PACKAGE_MANAGER = PackageManager.NPM;

    try {
      const files = await fs.promises.readdir(process.cwd());

      if (files.includes("yarn.lock")) return this.create(PackageManager.YARN);

      if (files.includes("pnpm-lock.yaml"))
        return this.create(PackageManager.PNPM);

      if (files.includes("bun.lock")) return this.create(PackageManager.BUN);

      return this.create(DEFAULT_PACKAGE_MANAGER);
    } catch {
      return this.create(DEFAULT_PACKAGE_MANAGER);
    }
  }
}
