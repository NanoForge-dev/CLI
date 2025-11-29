import { AbstractPackageManager } from "./abstract.package-manager";
import { PackageManager } from "./package-manager";
import { BunPackageManager } from "./package-managers/bun.package-manager";

export class PackageManagerFactory {
  public static create(name: PackageManager | string): AbstractPackageManager {
    switch (name) {
      case PackageManager.BUN:
        return new BunPackageManager();
      default:
        throw new Error(`Package manager ${name} is not managed.`);
    }
  }
}
