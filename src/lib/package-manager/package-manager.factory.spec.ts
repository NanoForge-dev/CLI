import { describe, expect, it } from "vitest";

import { PackageManager } from "./package-manager";
import { PackageManagerFactory } from "./package-manager.factory";
import { BunPackageManager } from "./package-managers/bun.package-manager";
import { LocalBunPackageManager } from "./package-managers/local-bun.package-manager";
import { NpmPackageManager } from "./package-managers/npm.package-manager";
import { PnpmPackageManager } from "./package-managers/pnpm.package-manager";
import { YarnPackageManager } from "./package-managers/yarn.package-manager";

describe("PackageManagerFactory", () => {
  describe("create", () => {
    it("should create BunPackageManager", () => {
      expect(PackageManagerFactory.create(PackageManager.BUN)).toBeInstanceOf(BunPackageManager);
    });

    it("should create LocalBunPackageManager", () => {
      expect(PackageManagerFactory.create(PackageManager.LOCAL_BUN)).toBeInstanceOf(
        LocalBunPackageManager,
      );
    });

    it("should create NpmPackageManager", () => {
      expect(PackageManagerFactory.create(PackageManager.NPM)).toBeInstanceOf(NpmPackageManager);
    });

    it("should create PnpmPackageManager", () => {
      expect(PackageManagerFactory.create(PackageManager.PNPM)).toBeInstanceOf(PnpmPackageManager);
    });

    it("should create YarnPackageManager", () => {
      expect(PackageManagerFactory.create(PackageManager.YARN)).toBeInstanceOf(YarnPackageManager);
    });

    it("should throw for unsupported package manager", () => {
      expect(() => PackageManagerFactory.create("unknown")).toThrow(
        "Package manager unknown is not managed.",
      );
    });
  });
});
