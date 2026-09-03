import { SchematicTestRunner, type UnitTestTree } from "@angular-devkit/schematics/testing";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const collectionPath = resolve(__dirname, "../dist/collection.json");

describe("application schematic", () => {
  const runner = new SchematicTestRunner("schematics", collectionPath);

  describe("with TypeScript (default)", () => {
    let tree: UnitTestTree;
    let packageJson: any;

    beforeAll(async () => {
      tree = await runner.runSchematic("application", { name: "my-app" });
      packageJson = JSON.parse(tree.readContent("/my-app/package.json"));
    });

    it("should generate project files", () => {
      expect(tree.files).toContain("/my-app/package.json");
      expect(tree.files).toContain("/my-app/tsconfig.json");
      expect(tree.files).toContain("/my-app/eslint.config.js");
      expect(tree.files).toContain("/my-app/prettier.config.js");
      expect(tree.files).toContain("/my-app/README.md");
      expect(tree.files).toContain("/my-app/.gitignore");
      expect(tree.files).not.toContain("/my-app/.env");
      expect(tree.files).not.toContain("/my-app/pnpm-workspace.yaml");
    });

    it("should set the project name in package.json", () => {
      expect(packageJson.name).toBe("my-app");
    });

    it("should not include ecs-server by default", () => {
      expect(packageJson.devDependencies["@nanoforge-dev/ecs-server"]).toBeUndefined();
    });

    it("should not include pnpm config by default", () => {
      expect(packageJson).not.toHaveProperty("pnpm");
    });

    it("should not include init functions docs by default", () => {
      expect(tree.readContent("/my-app/README.md")).not.toContain(
        "│   └── init/               # Lifecycle hooks (before-init, after-run, …)",
      );
    });
  });

  describe("with JavaScript", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("application", {
        name: "js-app",
        language: "js",
      });
    });

    it("should generate JS project files", () => {
      expect(tree.files).toContain("/js-app/package.json");
      expect(tree.files).toContain("/js-app/jsconfig.json");
      expect(tree.files).not.toContain("/js-app/tsconfig.json");
      expect(tree.files).not.toContain("/js-app/.env");
    });
  });

  describe("with JavaScript and no lint", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("application", {
        name: "js-no-lint-app",
        language: "js",
        lint: false,
      });
    });

    it("should generate JS project files without lint files", () => {
      expect(tree.files).toContain("/js-no-lint-app/package.json");
      expect(tree.files).not.toContain("/js-no-lint-app/eslint.config.json");
      expect(tree.files).not.toContain("/js-no-lint-app/prettier.config.json");
      expect(tree.files).not.toContain("/js-no-lint-app/.prettierignore");
      expect(tree.files).not.toContain("/js-no-lint-app/jsconfig.json");
      expect(tree.files).not.toContain("/js-no-lint-app/tsconfig.json");
    });
  });

  describe("with server enabled", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("application", {
        name: "server-app",
        server: true,
      });
    });

    it("should include env file", () => {
      expect(tree.files).toContain("/server-app/.env");
    });

    it("should include ecs-server dependency", () => {
      const packageJson = JSON.parse(tree.readContent("/server-app/package.json"));
      expect(packageJson.devDependencies["@nanoforge-dev/ecs-server"]).toBeDefined();
    });
  });

  describe("with custom options", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("application", {
        name: "custom-app",
        version: "1.2.3",
        author: "Test Author",
        description: "A test project",
        editor: true,
      });
    });

    it("should apply custom options to package.json", () => {
      const packageJson = JSON.parse(tree.readContent("/custom-app/package.json"));
      expect(packageJson.version).toBe("1.2.3");
      expect(packageJson.author).toBe("Test Author");
      expect(packageJson.description).toBe("A test project");
      expect(packageJson.devDependencies["@nanoforge-dev/core-editor"]).toBeDefined();
      expect(packageJson.devDependencies["@nanoforge-dev/graphics-2d-editor"]).toBeDefined();
    });
  });

  describe("with custom directory", () => {
    it("should generate files in the specified directory", async () => {
      const tree = await runner.runSchematic("application", {
        name: "my-app",
        directory: "custom-dir",
      });
      expect(tree.files).toContain("/custom-dir/package.json");
    });
  });

  describe("with pnpm", () => {
    it("should generate specifications of pnpm", async () => {
      const tree = await runner.runSchematic("application", {
        name: "pnpm-app",
        packageManager: "pnpm",
        server: true,
      });
      expect(tree.files).toContain("/pnpm-app/package.json");
      expect(tree.files).toContain("/pnpm-app/pnpm-workspace.yaml");
      const packageJson = JSON.parse(tree.readContent("/pnpm-app/package.json"));
      expect(packageJson).toHaveProperty("pnpm", {
        neverBuiltDependencies: [],
      });
    });
  });

  describe("with init functions", () => {
    it("should generate specifications of init functions", async () => {
      const tree = await runner.runSchematic("application", {
        name: "init-functions-app",
        initFunctions: true,
      });
      expect(tree.files).toContain("/init-functions-app/README.md");
      const content = tree.readContent("/init-functions-app/README.md");
      expect(content).toContain(
        "│   └── init/               # Lifecycle hooks (before-init, after-run, …)",
      );
    });
  });
});
