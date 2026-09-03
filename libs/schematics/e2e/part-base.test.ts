import { SchematicTestRunner, type UnitTestTree } from "@angular-devkit/schematics/testing";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const collectionPath = resolve(__dirname, "../dist/collection.json");

describe("part-base schematic", () => {
  const runner = new SchematicTestRunner("schematics", collectionPath);

  describe("client part with TypeScript", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("part-base", {
        directory: "my-app",
        part: "client",
        language: "ts",
      });
    });

    it("should generate client directory structure", () => {
      expect(tree.files).toContain("/my-app/client/components/example.component.ts");
      expect(tree.files).toContain("/my-app/client/systems/example.system.ts");
    });

    it("should generate the client save file", () => {
      expect(tree.files).toContain("/my-app/.nanoforge/client.save.json");
    });

    it("should not generate server save file", () => {
      expect(tree.files).not.toContain("/my-app/.nanoforge/server.save.json");
    });

    it("should not generate init functions by default", () => {
      const initFiles = tree.files.filter((f) => f.includes("/init/"));
      expect(initFiles).toHaveLength(0);
    });

    it("should generate a valid save file", () => {
      const save = JSON.parse(tree.readContent("/my-app/.nanoforge/client.save.json"));
      expect(save.libraries).toBeDefined();
      expect(save.components).toBeDefined();
      expect(save.systems).toBeDefined();
      expect(save.entities).toBeDefined();
    });
  });

  describe("server part with TypeScript", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("part-base", {
        directory: "my-app",
        part: "server",
        language: "ts",
      });
    });

    it("should generate server directory structure", () => {
      expect(tree.files).toContain("/my-app/server/components/example.component.ts");
      expect(tree.files).toContain("/my-app/server/systems/example.system.ts");
    });

    it("should generate the server save file", () => {
      expect(tree.files).toContain("/my-app/.nanoforge/server.save.json");
    });

    it("should not generate client save file", () => {
      expect(tree.files).not.toContain("/my-app/.nanoforge/client.save.json");
    });
  });

  describe("with init functions enabled", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("part-base", {
        directory: "my-app",
        part: "client",
        language: "ts",
        initFunctions: true,
      });
    });

    it("should generate init function files", () => {
      expect(tree.files).toContain("/my-app/client/init/before-init.ts");
      expect(tree.files).toContain("/my-app/client/init/after-init.ts");
      expect(tree.files).toContain("/my-app/client/init/before-registry-init.ts");
      expect(tree.files).toContain("/my-app/client/init/after-registry-init.ts");
      expect(tree.files).toContain("/my-app/client/init/before-run.ts");
      expect(tree.files).toContain("/my-app/client/init/after-run.ts");
    });
  });

  describe("with JavaScript", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("part-base", {
        directory: "my-app",
        part: "client",
        language: "js",
      });
    });

    it("should generate JS files", () => {
      expect(tree.files).toContain("/my-app/client/components/example.component.js");
      expect(tree.files).toContain("/my-app/client/systems/example.system.js");
    });
  });

  describe("with custom directory", () => {
    it("should generate files in the specified directory", async () => {
      const tree = await runner.runSchematic("part-base", {
        name: "my-app",
        part: "client",
        directory: "custom-dir",
      });
      expect(tree.files).toContain("/custom-dir/client/components/example.component.ts");
    });
  });
});
