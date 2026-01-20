import fs from "fs";
import { resolve } from "path";

import { type AbstractPackageManager } from "./abstract.package-manager";
import { PackageManager } from "./package-manager";
import { BunPackageManager } from "./package-managers/bun.package-manager";
import { LocalBunPackageManager } from "./package-managers/local-bun.package-manager";
import { NpmPackageManager } from "./package-managers/npm.package-manager";
import { PnpmPackageManager } from "./package-managers/pnpm.package-manager";
import { YarnPackageManager } from "./package-managers/yarn.package-manager";

export class PackageManagerFactory {
  public static create(name: PackageManager | string): AbstractPackageManager {
    switch (name) {
      case PackageManager.BUN:
        return new BunPackageManager();
      case PackageManager.LOCAL_BUN:
        return new LocalBunPackageManager();
      case PackageManager.NPM:
        return new NpmPackageManager();
      case PackageManager.PNPM:
        return new PnpmPackageManager();
      case PackageManager.YARN:
        return new YarnPackageManager();
      default:
        throw new Error(`Package manager ${name} is not managed.`);
    }
  }

  public static async find(directory: string = "."): Promise<AbstractPackageManager> {
    const DEFAULT_PACKAGE_MANAGER = PackageManager.NPM;

    try {
      const files = await fs.promises.readdir(resolve(directory));

      if (files.includes("bun.lock")) {
        return this.create(PackageManager.BUN);
      }

      if (files.includes("package-lock.json")) {
        return this.create(PackageManager.NPM);
      }

      if (files.includes("pnpm-lock.yaml")) {
        return this.create(PackageManager.PNPM);
      }

      if (files.includes("yarn.lock")) {
        return this.create(PackageManager.YARN);
      }

      return this.create(DEFAULT_PACKAGE_MANAGER);
    } catch {
      return this.create(DEFAULT_PACKAGE_MANAGER);
    }
  }
}
