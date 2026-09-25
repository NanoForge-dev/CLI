import { describe, expect, it, vi } from "vitest";

import { NanoforgeCollection } from "./nanoforge.collection";

const mockRunner = { run: vi.fn(async () => null), rawFullCommand: () => "" } as any;

describe("NanoforgeCollection", () => {
  const collection = new NanoforgeCollection(mockRunner);

  describe("getSchematics", () => {
    it("should return all available schematics", () => {
      const schematics = collection.getSchematics();
      const names = schematics.map((s) => s.name);
      expect(names).toContain("project");
      expect(names).toContain("workspace");
      expect(names).toContain("component");
      expect(names).toContain("system");
    });

    it("should have aliases for each schematic", () => {
      const schematics = collection.getSchematics();
      const aliases = schematics.map((s) => s.alias);
      expect(aliases).toContain("project");
      expect(aliases).toContain("workspace");
      expect(aliases).toContain("component");
      expect(aliases).toContain("system");
    });
  });

  describe("execute", () => {
    it("should accept a valid schematic name", async () => {
      await expect(collection.execute("project", [])).resolves.not.toThrow();
    });

    it("should accept a valid schematic alias", async () => {
      await expect(collection.execute("workspace", [])).resolves.not.toThrow();
    });

    it("should wrap the collection path in portable double quotes", async () => {
      await collection.execute("project", []);

      const args = mockRunner.run.mock.calls.at(-1)?.[0];
      expect(args[3]).toMatch(/^".*:project"$/);
    });

    it("should reject an invalid schematic name", async () => {
      await expect(collection.execute("invalid", [])).rejects.toThrow(
        'Invalid schematic "invalid"',
      );
    });
  });
});
