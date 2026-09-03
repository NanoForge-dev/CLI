import { SchematicTestRunner, type UnitTestTree } from "@angular-devkit/schematics/testing";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const collectionPath = resolve(__dirname, "../dist/collection.json");

describe("configuration schematic", () => {
  const runner = new SchematicTestRunner("schematics", collectionPath);

  describe("on an empty tree", () => {
    let tree: UnitTestTree;
    let config: Record<string, any>;

    beforeAll(async () => {
      tree = await runner.runSchematic("configuration", {
        name: "my-name",
      });
      config = JSON.parse(tree.readContent("/nanoforge.config.json"));
    });

    it("should generate nanoforge.config.json", () => {
      expect(tree.files).toContain("/nanoforge.config.json");
    });

    it("should create a valid JSON config file", () => {
      expect(() => JSON.parse(tree.readContent("/nanoforge.config.json"))).not.toThrow();
    });

    it("should include default client build config", () => {
      expect(config.name).toBe("my-name");
      expect(config.language).toBe("ts");
      expect(config.initFunctions).not.toBeDefined();
    });

    it("should include default client build config", () => {
      expect(config.client).toBeDefined();
      expect(config.client.enable).toBe(true);
    });

    it("should have server disabled", () => {
      expect(config.server.enable).toBe(false);
    });
  });

  describe("with js", () => {
    let tree: UnitTestTree;
    let config: Record<string, any>;

    beforeAll(async () => {
      tree = await runner.runSchematic("configuration", {
        name: "my-name",
        language: "js",
        initFunctions: true,
      });
      config = JSON.parse(tree.readContent("/nanoforge.config.json"));
    });

    it("should generate nanoforge.config.json", () => {
      expect(tree.files).toContain("/nanoforge.config.json");
    });

    it("should include default client build config", () => {
      expect(config.name).toBe("my-name");
      expect(config.language).toBe("js");
      expect(config.initFunctions).toBe(true);
    });

    it("should include default client build config", () => {
      expect(config.client).toBeDefined();
      expect(config.client.build.entry).toBe("client/main.js");
    });

    it("should include default editor config", () => {
      expect(config.client.editor.entry).toBe(".nanoforge/editor/client/main.js");
    });
  });

  describe("with server enabled", () => {
    let tree: UnitTestTree;
    let config: Record<string, any>;

    beforeAll(async () => {
      tree = await runner.runSchematic("configuration", {
        server: true,
      });
      config = JSON.parse(tree.readContent("/nanoforge.config.json"));
    });

    it("should generate config file", () => {
      expect(tree.files).toContain("/nanoforge.config.json");
    });

    it("should include server config with enable flag", () => {
      expect(config.server).toBeDefined();
      expect(config.server.enable).toBe(true);
    });
  });

  describe("with custom directory", () => {
    it("should generate config in the specified directory", async () => {
      const tree = await runner.runSchematic("configuration", {
        name: "my-app",
        directory: "custom-dir",
      });
      expect(tree.files).toContain("/custom-dir/nanoforge.config.json");
    });
  });
});
