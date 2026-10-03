import { SchematicTestRunner, type UnitTestTree } from "@angular-devkit/schematics/testing";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const collectionPath = resolve(__dirname, "../dist/collection.json");

describe("plugin schematic", () => {
  const runner = new SchematicTestRunner("schematics", collectionPath);

  describe("@acme/score-board", () => {
    let tree: UnitTestTree;

    beforeAll(async () => {
      tree = await runner.runSchematic("plugin", { name: "@acme/score-board" });
    });

    it("should generate the plugin in a folder named after its short name", () => {
      expect([...tree.files].sort()).toEqual([
        "/score-board/.gitignore",
        "/score-board/README.md",
        "/score-board/nanoforge.manifest.json",
        "/score-board/package.json",
        "/score-board/src/Panel.svelte",
        "/score-board/src/counter.ts",
        "/score-board/src/index.ts",
        "/score-board/svelte.config.js",
        "/score-board/tsconfig.json",
        "/score-board/vite.config.ts",
      ]);
    });

    it("should write a manifest whose ids match the plugin name", () => {
      const manifest = JSON.parse(tree.readContent("/score-board/nanoforge.manifest.json"));
      expect(manifest).toMatchObject({
        type: "plugin",
        name: "@acme/score-board",
        displayName: "Score Board",
        entry: { client: "index.js" },
        activation: ["onWidget:scoreBoard.panel", "onCommand:scoreBoard.add"],
      });
      expect(manifest.contributes.widgets[0].id).toBe("scoreBoard.panel");
    });

    it("should register in code what the manifest declares", () => {
      const index = tree.readContent("/score-board/src/index.ts");
      expect(index).toContain("id: 'scoreBoard.panel'");
      expect(index).toContain("registerCommand('scoreBoard.add'");
      expect(index).toContain("settings.get('@acme/score-board.step')");
      expect(index).toContain("resolveAsset('score-board.css')");
      expect(index).toContain("label: `Add ${step}`");
      expect(tree.readContent("/score-board/vite.config.ts")).toContain(
        "cssFileName: 'score-board'",
      );
      expect(tree.readContent("/score-board/src/Panel.svelte")).toContain(".score-board {");
    });

    it("should write a valid package.json with the editor packages", () => {
      const pkg = JSON.parse(tree.readContent("/score-board/package.json"));
      expect(pkg.name).toBe("score-board-editor-plugin");
      expect(pkg.devDependencies).toHaveProperty("@nanoforge-dev/editor-sdk");
      expect(pkg.devDependencies).toHaveProperty("@nanoforge-dev/editor-vite-plugin");
    });
  });

  it("should generate in the given directory", async () => {
    const tree = await runner.runSchematic("plugin", {
      name: "@acme/counter",
      directory: "plugins/my-counter",
    });
    expect(tree.files).toContain("/plugins/my-counter/nanoforge.manifest.json");
  });

  it("should refuse a name that is not @scope/name", async () => {
    for (const name of ["counter", "acme/counter", "@Acme/counter", "@acme/", "@acme/a b"])
      await expect(runner.runSchematic("plugin", { name })).rejects.toThrow();
  });
});
