import { SchematicTestRunner, type UnitTestTree } from "@angular-devkit/schematics/testing";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { type Save } from "@utils/main/save.type";

const collectionPath = resolve(__dirname, "../dist/collection.json");
const tmpDir = resolve(__dirname, "../.tmp-e2e");

const clientSave: Save = {
  libraries: [
    {
      id: "ecsLibrary",
      type: "component-system",
      name: "ECSClientLibrary",
      path: "@nanoforge-dev/ecs-client",
    },
    {
      id: "graphicsLibrary",
      type: "graphics",
      name: "Graphics2DLibrary",
      path: "@nanoforge-dev/graphics-2d",
    },
  ],
  components: [
    {
      name: "ExampleComponent",
      path: "./components/example.component.ts",
      paramsNames: ["exampleValueName", "exampleNum", "__RESERVED_ASSET_exampleAsset"],
    },
  ],
  systems: [{ name: "exampleSystem", path: "./systems/example.system.js" }],
  entities: [
    {
      id: "player",
      components: {
        ExampleComponent: {
          exampleValueName: "test",
          exampleNum: 5,
          exampleAsset: "/path/to/asset",
        },
      },
    },
  ],
};

const serverSave: Save = {
  libraries: [
    {
      id: "ecsLibrary",
      type: "component-system",
      name: "ECSServerLibrary",
      path: "@nanoforge-dev/ecs-server",
    },
  ],
  components: [],
  systems: [],
  entities: [],
};

describe("part-main schematic", () => {
  const runner = new SchematicTestRunner("schematics", collectionPath);

  beforeAll(() => {
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(resolve(tmpDir, "client.save.json"), JSON.stringify(clientSave));
    writeFileSync(resolve(tmpDir, "server.save.json"), JSON.stringify(serverSave));
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  describe("client main with TypeScript", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("part-main", {
        directory: "my-app",
        part: "client",
        language: "ts",
        saveFile: resolve(tmpDir, "client.save.json"),
      });
    });

    it("should generate client/main.ts", () => {
      expect(tree.files).toContain("/my-app/client/main.ts");
    });

    it("should contain NanoforgeFactory.createClient()", () => {
      const content = tree.readContent("/my-app/client/main.ts");
      expect(content).toContain("NanoforgeFactory.createClient()");
    });

    it("should contain typed main function", () => {
      const content = tree.readContent("/my-app/client/main.ts");
      expect(content).toContain("export async function main(options: IRunOptions)");
    });

    it("should import and instantiate libraries", () => {
      const content = tree.readContent("/my-app/client/main.ts");
      expect(content).toContain('import { ECSClientLibrary } from "@nanoforge-dev/ecs-client"');
      expect(content).toContain('import { Graphics2DLibrary } from "@nanoforge-dev/graphics-2d"');
      expect(content).toContain("const ecsLibrary = new ECSClientLibrary();");
      expect(content).toContain("const graphicsLibrary = new Graphics2DLibrary();");
    });

    it("should register entities and systems", () => {
      const content = tree.readContent("/my-app/client/main.ts");
      expect(content).toContain("const player = registry.spawnEntity();");
      expect(content).toContain(
        'registry.addComponent(player, new ExampleComponent("test", 5, assetManagerLibrary.getAsset("/path/to/asset")));',
      );
      expect(content).toContain("registry.addSystem(exampleSystem);");
    });

    it("should not contain editor libs", () => {
      const content = tree.readContent("/my-app/client/main.ts");
      expect(content).not.toContain("@nanoforge-dev/graphics-2d-editor");
    });
  });

  describe("server main with TypeScript", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("part-main", {
        directory: "my-app",
        part: "server",
        language: "ts",
        saveFile: resolve(tmpDir, "server.save.json"),
      });
    });

    it("should generate server/main.ts", () => {
      expect(tree.files).toContain("/my-app/server/main.ts");
    });

    it("should contain NanoforgeFactory.createServer()", () => {
      const content = tree.readContent("/my-app/server/main.ts");
      expect(content).toContain("NanoforgeFactory.createServer()");
    });
  });

  describe("client main with JavaScript", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("part-main", {
        directory: "my-app",
        part: "client",
        language: "js",
        saveFile: resolve(tmpDir, "client.save.json"),
      });
    });

    it("should generate client/main.js", () => {
      expect(tree.files).toContain("/my-app/client/main.js");
    });

    it("should not contain TypeScript type annotations", () => {
      const content = tree.readContent("/my-app/client/main.js");
      expect(content).not.toContain("IRunOptions");
      expect(content).toContain("export async function main(options)");
    });
  });

  describe("with init functions enabled", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("part-main", {
        directory: "my-app",
        part: "client",
        language: "ts",
        initFunctions: true,
        saveFile: resolve(tmpDir, "client.save.json"),
      });
    });

    it("should import init functions", () => {
      const content = tree.readContent("/my-app/client/main.ts");
      expect(content).toContain('import { beforeInit } from "./init/before-init"');
      expect(content).toContain('import { afterRun } from "./init/after-run"');
    });

    it("should call init functions in the main body", () => {
      const content = tree.readContent("/my-app/client/main.ts");
      expect(content).toContain("await beforeInit(app);");
      expect(content).toContain("await afterInit(app);");
      expect(content).toContain("await beforeRegistryInit(app, registry);");
      expect(content).toContain("await afterRegistryInit(app, registry);");
      expect(content).toContain("await beforeRun(app);");
      expect(content).toContain("await afterRun(app);");
    });
  });

  describe("editor mode", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("part-main", {
        directory: "my-app",
        part: "client",
        language: "ts",
        editor: true,
        saveFile: resolve(tmpDir, "client.save.json"),
      });
    });

    it("should generate the editor main file under .nanoforge/editor", () => {
      expect(tree.files).toContain("/my-app/.nanoforge/editor/client/main.ts");
    });

    it("should import from @nanoforge-dev/core-editor", () => {
      const content = tree.readContent("/my-app/.nanoforge/editor/client/main.ts");
      expect(content).toContain('from "@nanoforge-dev/core-editor"');
    });

    it("should use IEditorRunOptions type", () => {
      const content = tree.readContent("/my-app/.nanoforge/editor/client/main.ts");
      expect(content).toContain("IEditorRunOptions");
      expect(content).toContain("export async function main(options: IEditorRunOptions)");
    });

    it("should use entity paramsValues from editor save", () => {
      const content = tree.readContent("/my-app/.nanoforge/editor/client/main.ts");
      expect(content).toContain(
        'options.editor.save.entities[0].components["ExampleComponent"]["exampleValueName"]',
      );
      expect(content).toContain(
        'assetManagerLibrary.getAsset(options.editor.save.entities[0].components["ExampleComponent"]["exampleAsset"])',
      );
    });

    it("should import components and systems with relative path to root", () => {
      const content = tree.readContent("/my-app/.nanoforge/editor/client/main.ts");
      expect(content).toContain(
        'import { ExampleComponent } from "../../../client/components/example.component"',
      );
      expect(content).toContain(
        'import { exampleSystem } from "../../../client/systems/example.system"',
      );
    });

    it("should create a entityId reserved component", () => {
      const content = tree.readContent("/my-app/.nanoforge/editor/client/main.ts");
      expect(content).toContain(
        'registry.addComponent(player, { name: "__RESERVED_entityId", entityId: "player" });',
      );
    });

    it("should init graphics editor", () => {
      const content = tree.readContent("/my-app/.nanoforge/editor/client/main.ts");
      expect(content).toContain(
        'import { Graphics2DEditorLibrary } from "@nanoforge-dev/graphics-2d-editor"',
      );
      expect(content).toContain("const graphicsEditorLibrary = new Graphics2DEditorLibrary();");
    });
  });
});
