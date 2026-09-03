import { SchematicTestRunner, type UnitTestTree } from "@angular-devkit/schematics/testing";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const collectionPath = resolve(__dirname, "../dist/collection.json");

describe("component schematic", () => {
  const runner = new SchematicTestRunner("schematics", collectionPath);

  describe("TypeScript component for client part", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("component", {
        name: "myComponent",
        directory: "my-app",
        part: "client",
        language: "ts",
      });
    });

    it("should generate a .ts component file", () => {
      expect(tree.files).toContain("/my-app/my-component.component.ts");
    });

    it("should use PascalCase class name", () => {
      const content = tree.readContent("/my-app/my-component.component.ts");
      expect(content).toContain("class MyComponentComponent");
    });

    it("should use the correct part in the import", () => {
      const content = tree.readContent("/my-app/my-component.component.ts");
      expect(content).toContain("@nanoforge-dev/ecs-client");
    });

    it("should export the component name as default", () => {
      const content = tree.readContent("/my-app/my-component.component.ts");
      expect(content).toContain("export default MyComponentComponent.name");
    });

    it("should export the EDITOR_COMPONENT_MANIFEST", () => {
      const content = tree.readContent("/my-app/my-component.component.ts");
      expect(content).toContain("export const EDITOR_COMPONENT_MANIFEST");
      expect(content).toContain('name: "MyComponent"');
    });
  });

  describe("TypeScript component for server part", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("component", {
        name: "myComponent",
        directory: "my-app",
        part: "server",
        language: "ts",
      });
    });

    it("should generate a .ts component file", () => {
      expect(tree.files).toContain("/my-app/my-component.component.ts");
    });

    it("should use the correct part in the import", () => {
      const content = tree.readContent("/my-app/my-component.component.ts");
      expect(content).toContain("@nanoforge-dev/ecs-server");
    });
  });

  describe("JavaScript component", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("component", {
        name: "myComponent",
        directory: "my-app",
        part: "client",
        language: "js",
      });
    });

    it("should generate a .js component file", () => {
      expect(tree.files).toContain("/my-app/my-component.component.js");
    });

    it("should use PascalCase class name", () => {
      const content = tree.readContent("/my-app/my-component.component.js");
      expect(content).toContain("class MyComponentComponent");
    });

    it("should use the correct part in the JSDoc typedef", () => {
      const content = tree.readContent("/my-app/my-component.component.js");
      expect(content).toContain("@nanoforge-dev/ecs-client");
    });

    it("should export the EDITOR_COMPONENT_MANIFEST", () => {
      const content = tree.readContent("/my-app/my-component.component.js");
      expect(content).toContain("export const EDITOR_COMPONENT_MANIFEST");
      expect(content).toContain('name: "MyComponent"');
    });
  });

  describe("name formatting", () => {
    it("should handle kebab-case name", async () => {
      const tree = await runner.runSchematic("component", {
        name: "my-component",
        directory: "my-app",
        part: "client",
        language: "ts",
      });
      expect(tree.files).toContain("/my-app/my-component.component.ts");
      const content = tree.readContent("/my-app/my-component.component.ts");
      expect(content).toContain("class MyComponentComponent");
    });

    it("should handle PascalCase name", async () => {
      const tree = await runner.runSchematic("component", {
        name: "MyComponent",
        directory: "my-app",
        part: "client",
        language: "ts",
      });
      expect(tree.files).toContain("/my-app/my-component.component.ts");
      const content = tree.readContent("/my-app/my-component.component.ts");
      expect(content).toContain("class MyComponentComponent");
    });

    it("should handle snake_case name", async () => {
      const tree = await runner.runSchematic("component", {
        name: "my_component",
        directory: "my-app",
        part: "client",
        language: "ts",
      });
      expect(tree.files).toContain("/my-app/my-component.component.ts");
      const content = tree.readContent("/my-app/my-component.component.ts");
      expect(content).toContain("class MyComponentComponent");
    });
  });

  describe("custom directory", () => {
    it("should generate file in the specified directory", async () => {
      const tree = await runner.runSchematic("component", {
        name: "myComponent",
        directory: "src/client/components",
        part: "client",
        language: "ts",
      });
      expect(tree.files).toContain("/src/client/components/my-component.component.ts");
    });
  });

  describe("default values", () => {
    it("should default to TypeScript when language is not specified", async () => {
      const tree = await runner.runSchematic("component", {
        name: "myComponent",
        directory: "my-app",
        part: "client",
      });
      expect(tree.files).toContain("/my-app/my-component.component.ts");
    });

    it("should default to current directory when directory is not specified", async () => {
      const tree = await runner.runSchematic("component", {
        name: "myComponent",
        part: "client",
      });
      expect(tree.files).toContain("/my-component.component.ts");
    });
  });
});
