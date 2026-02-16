import { describe, expect, it } from "vitest";

import { NanoforgeCollection } from "./nanoforge.collection";

const mockRunner = { run: async () => null, rawFullCommand: () => "" } as any;

describe("NanoforgeCollection", () => {
  const collection = new NanoforgeCollection(mockRunner);

  describe("getSchematics", () => {
    it("should return all available schematics", () => {
      const schematics = collection.getSchematics();
      const names = schematics.map((s) => s.name);
      expect(names).toContain("application");
      expect(names).toContain("configuration");
      expect(names).toContain("part-base");
      expect(names).toContain("part-main");
    });

    it("should have aliases for each schematic", () => {
      const schematics = collection.getSchematics();
      const aliases = schematics.map((s) => s.alias);
      expect(aliases).toContain("application");
      expect(aliases).toContain("config");
      expect(aliases).toContain("base");
      expect(aliases).toContain("main");
    });
  });

  describe("execute", () => {
    it("should accept a valid schematic name", async () => {
      await expect(collection.execute("application", [])).resolves.not.toThrow();
    });

    it("should accept a valid schematic alias", async () => {
      await expect(collection.execute("config", [])).resolves.not.toThrow();
    });

    it("should reject an invalid schematic name", async () => {
      await expect(collection.execute("invalid", [])).rejects.toThrow(
        'Invalid schematic "invalid"',
      );
    });
  });
});
