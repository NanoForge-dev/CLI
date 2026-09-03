import { SchematicTestRunner, type UnitTestTree } from "@angular-devkit/schematics/testing";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const collectionPath = resolve(__dirname, "../dist/collection.json");

describe("system schematic", () => {
  const runner = new SchematicTestRunner("schematics", collectionPath);

  describe("TypeScript system for client part", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("system", {
        name: "mySystem",
        directory: "my-app",
        part: "client",
        language: "ts",
      });
    });

    it("should generate a .ts system file", () => {
      expect(tree.files).toContain("/my-app/my-system.system.ts");
    });

    it("should use camelCase function name", () => {
      const content = tree.readContent("/my-app/my-system.system.ts");
      expect(content).toContain("export const mySystemSystem");
    });

    it("should use the correct part in the import", () => {
      const content = tree.readContent("/my-app/my-system.system.ts");
      expect(content).toContain("@nanoforge-dev/ecs-client");
    });

    it("should export the system name as default", () => {
      const content = tree.readContent("/my-app/my-system.system.ts");
      expect(content).toContain("export default mySystemSystem.name");
    });

    it("should export the EDITOR_SYSTEM_MANIFEST", () => {
      const content = tree.readContent("/my-app/my-system.system.ts");
      expect(content).toContain("export const EDITOR_SYSTEM_MANIFEST");
      expect(content).toContain('name: "mySystem"');
    });
  });

  describe("TypeScript system for server part", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("system", {
        name: "mySystem",
        directory: "my-app",
        part: "server",
        language: "ts",
      });
    });

    it("should generate a .ts system file", () => {
      expect(tree.files).toContain("/my-app/my-system.system.ts");
    });

    it("should use the correct part in the import", () => {
      const content = tree.readContent("/my-app/my-system.system.ts");
      expect(content).toContain("@nanoforge-dev/ecs-server");
    });
  });

  describe("JavaScript system", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("system", {
        name: "mySystem",
        directory: "my-app",
        part: "client",
        language: "js",
      });
    });

    it("should generate a .js system file", () => {
      expect(tree.files).toContain("/my-app/my-system.system.js");
    });

    it("should use camelCase function name", () => {
      const content = tree.readContent("/my-app/my-system.system.js");
      expect(content).toContain("export const mySystemSystem");
    });

    it("should use the correct part in the JSDoc typedef", () => {
      const content = tree.readContent("/my-app/my-system.system.js");
      expect(content).toContain("@nanoforge-dev/ecs-client");
    });

    it("should export the EDITOR_SYSTEM_MANIFEST", () => {
      const content = tree.readContent("/my-app/my-system.system.js");
      expect(content).toContain("export const EDITOR_SYSTEM_MANIFEST");
      expect(content).toContain('name: "mySystem"');
    });
  });

  describe("name formatting", () => {
    it("should handle kebab-case name", async () => {
      const tree = await runner.runSchematic("system", {
        name: "my-system",
        directory: "my-app",
        part: "client",
        language: "ts",
      });
      expect(tree.files).toContain("/my-app/my-system.system.ts");
      const content = tree.readContent("/my-app/my-system.system.ts");
      expect(content).toContain("export const mySystemSystem");
    });

    it("should handle PascalCase name", async () => {
      const tree = await runner.runSchematic("system", {
        name: "MySystem",
        directory: "my-app",
        part: "client",
        language: "ts",
      });
      expect(tree.files).toContain("/my-app/my-system.system.ts");
      const content = tree.readContent("/my-app/my-system.system.ts");
      expect(content).toContain("export const mySystemSystem");
    });

    it("should handle snake_case name", async () => {
      const tree = await runner.runSchematic("system", {
        name: "my_system",
        directory: "my-app",
        part: "client",
        language: "ts",
      });
      expect(tree.files).toContain("/my-app/my-system.system.ts");
      const content = tree.readContent("/my-app/my-system.system.ts");
      expect(content).toContain("export const mySystemSystem");
    });
  });

  describe("custom directory", () => {
    it("should generate file in the specified directory", async () => {
      const tree = await runner.runSchematic("system", {
        name: "mySystem",
        directory: "src/client/systems",
        part: "client",
        language: "ts",
      });
      expect(tree.files).toContain("/src/client/systems/my-system.system.ts");
    });
  });

  describe("default values", () => {
    it("should default to TypeScript when language is not specified", async () => {
      const tree = await runner.runSchematic("system", {
        name: "mySystem",
        directory: "my-app",
        part: "client",
      });
      expect(tree.files).toContain("/my-app/my-system.system.ts");
    });

    it("should default to current directory when directory is not specified", async () => {
      const tree = await runner.runSchematic("system", {
        name: "mySystem",
        part: "client",
      });
      expect(tree.files).toContain("/my-system.system.ts");
    });
  });
});
