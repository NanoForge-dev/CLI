import { describe, expect, it } from "vitest";

import { PackageManager } from "./package-manager";
import { PackageManagerName } from "./package-manager-name";
import { PackageManagerFactory } from "./package-manager.factory";

describe("PackageManagerFactory", () => {
  describe("create", () => {
    it("should create a PackageManager for BUN", () => {
      const pm = PackageManagerFactory.create(PackageManagerName.BUN);
      expect(pm).toBeInstanceOf(PackageManager);
      expect(pm.name).toBe(PackageManagerName.BUN);
    });

    it("should create a PackageManager for LOCAL_BUN", () => {
      const pm = PackageManagerFactory.create(PackageManagerName.LOCAL_BUN);
      expect(pm).toBeInstanceOf(PackageManager);
      expect(pm.name).toBe(PackageManagerName.LOCAL_BUN);
    });

    it("should create a PackageManager for NPM", () => {
      const pm = PackageManagerFactory.create(PackageManagerName.NPM);
      expect(pm).toBeInstanceOf(PackageManager);
      expect(pm.name).toBe(PackageManagerName.NPM);
    });

    it("should create a PackageManager for PNPM", () => {
      const pm = PackageManagerFactory.create(PackageManagerName.PNPM);
      expect(pm).toBeInstanceOf(PackageManager);
      expect(pm.name).toBe(PackageManagerName.PNPM);
    });

    it("should create a PackageManager for YARN", () => {
      const pm = PackageManagerFactory.create(PackageManagerName.YARN);
      expect(pm).toBeInstanceOf(PackageManager);
      expect(pm.name).toBe(PackageManagerName.YARN);
    });

    it("should throw for unsupported package manager", () => {
      expect(() => PackageManagerFactory.create("unknown")).toThrow(
        "Package manager 'unknown' is not managed/supported.",
      );
    });
  });
});
