import { describe, expect, it } from "vitest";

import { generateMain } from "./main-functions";
import { type Save, SaveLibraryTypeEnum } from "./save.type";

const emptySave: Save = {
  libraries: [],
  components: [],
  systems: [],
  entities: [],
};

describe("generateMain", () => {
  it("should generate a client main with TypeScript types", () => {
    const result = generateMain(
      { part: "client", language: "ts", initFunctions: false, editor: false },
      emptySave,
    );
    expect(result).toContain("NanoforgeFactory.createClient()");
    expect(result).toContain("IRunOptions");
    expect(result).toContain("export async function main(options: IRunOptions)");
  });

  it("should generate a server main without types", () => {
    const result = generateMain(
      { part: "server", language: "js", initFunctions: false, editor: false },
      emptySave,
    );
    expect(result).toContain("NanoforgeFactory.createServer()");
    expect(result).not.toContain("IRunOptions");
    expect(result).toContain("export async function main(options)");
  });

  it("should include init function imports and calls when enabled", () => {
    const result = generateMain(
      { part: "client", language: "ts", initFunctions: true, editor: false },
      emptySave,
    );
    expect(result).toContain('import { beforeInit } from "./init/before-init";');
    expect(result).toContain("await beforeInit(app);");
    expect(result).toContain("await afterInit(app);");
    expect(result).toContain("await beforeRegistryInit(app, registry);");
    expect(result).toContain("await afterRegistryInit(app, registry);");
    expect(result).toContain("await beforeRun(app);");
    expect(result).toContain("await afterRun(app);");
  });

  it("should not include init functions when disabled", () => {
    const result = generateMain(
      { part: "client", language: "ts", initFunctions: false, editor: false },
      emptySave,
    );
    expect(result).not.toContain("beforeInit");
    expect(result).not.toContain("afterRun");
  });

  it("should generate library imports, instances, and init calls", () => {
    const save: Save = {
      ...emptySave,
      libraries: [
        {
          id: "gfx",
          type: SaveLibraryTypeEnum.GRAPHICS,
          name: "Graphics",
          path: "@nanoforge/graphics",
        },
      ],
    };
    const result = generateMain(
      { part: "client", language: "ts", initFunctions: false, editor: false },
      save,
    );
    expect(result).toContain('import { Graphics } from "@nanoforge/graphics";');
    expect(result).toContain("const gfx = new Graphics();");
    expect(result).toContain("app.useGraphics(gfx);");
  });

  it("should generate entity and system registration", () => {
    const save: Save = {
      libraries: [
        {
          id: "ecs",
          type: SaveLibraryTypeEnum.COMPONENT_SYSTEM,
          name: "ECS",
          path: "@nanoforge/ecs",
        },
      ],
      components: [{ name: "Position", path: "./components/position", paramsNames: ["x", "y"] }],
      systems: [{ name: "PhysicsSystem", path: "./systems/physics" }],
      entities: [
        {
          id: "player",
          components: { Position: { x: 1, y: 2 } },
        },
      ],
    };
    const result = generateMain(
      { part: "client", language: "ts", initFunctions: false, editor: false },
      save,
    );
    expect(result).toContain("const registry = ecs.registry;");
    expect(result).toContain("const player = registry.spawnEntity();");
    expect(result).toContain("registry.addComponent(player, new Position(1, 2));");
    expect(result).toContain("registry.addSystem(PhysicsSystem);");
  });

  it("should generate entity even in reverse order", () => {
    const save: Save = {
      libraries: [
        {
          id: "ecs",
          type: SaveLibraryTypeEnum.COMPONENT_SYSTEM,
          name: "ECS",
          path: "@nanoforge/ecs",
        },
      ],
      components: [{ name: "Position", path: "./components/position", paramsNames: ["y", "x"] }],
      systems: [{ name: "PhysicsSystem", path: "./systems/physics" }],
      entities: [
        {
          id: "player",
          components: { Position: { x: 1, y: 2 } },
        },
      ],
    };
    const result = generateMain(
      { part: "client", language: "ts", initFunctions: false, editor: false },
      save,
    );
    expect(result).toContain("const registry = ecs.registry;");
    expect(result).toContain("const player = registry.spawnEntity();");
    expect(result).toContain("registry.addComponent(player, new Position(2, 1));");
    expect(result).toContain("registry.addSystem(PhysicsSystem);");
  });
});
