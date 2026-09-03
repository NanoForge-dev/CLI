import { describe, expect, it } from "vitest";

import { MainGenerator } from "./main.generator";
import { SaveLibraryTypeEnum } from "./save.type";

describe("MainGenerator", () => {
  it("should start with an empty buffer", () => {
    expect(new MainGenerator().toString()).toBe("");
  });

  describe("generateBaseImports", () => {
    it("should include type import when hasTypes is true", () => {
      const result = new MainGenerator().generateBaseImports(true).toString();
      expect(result).toContain('import { type IRunOptions } from "@nanoforge-dev/common";');
      expect(result).toContain('import { NanoforgeFactory } from "@nanoforge-dev/core";');
    });

    it("should omit type import when hasTypes is false", () => {
      const result = new MainGenerator().generateBaseImports(false).toString();
      expect(result).not.toContain("IRunOptions");
      expect(result).toContain('import { NanoforgeFactory } from "@nanoforge-dev/core";');
    });
  });

  describe("generateApp", () => {
    it("should generate createClient call for client", () => {
      const result = new MainGenerator().generateApp(false).toString();
      expect(result).toContain("NanoforgeFactory.createClient()");
    });

    it("should generate createServer call for server", () => {
      const result = new MainGenerator().generateApp(true).toString();
      expect(result).toContain("NanoforgeFactory.createServer()");
    });
  });

  describe("generateAppInit", () => {
    it("should generate await app.init(options)", () => {
      const result = new MainGenerator().generateAppInit().toString();
      expect(result).toContain("await app.init(options);");
    });
  });

  describe("generateAppRun", () => {
    it("should generate await app.run()", () => {
      const result = new MainGenerator().generateAppRun(false).toString();
      expect(result).toContain("await app.run();");
    });
  });

  describe("generateMainFunction", () => {
    it("should generate typed function signature when hasTypes is true", () => {
      const result = new MainGenerator().generateMainFunction(true, () => {}).toString();
      expect(result).toContain("export async function main(options: IRunOptions) {");
      expect(result).toContain("}");
    });

    it("should generate untyped function signature when hasTypes is false", () => {
      const result = new MainGenerator().generateMainFunction(false, () => {}).toString();
      expect(result).toContain("export async function main(options) {");
    });

    it("should indent content inside the function body", () => {
      const result = new MainGenerator()
        .generateMainFunction(false, (gen) => {
          gen.generateAppInit();
        })
        .toString();
      expect(result).toContain("  await app.init(options);");
    });
  });

  describe("generateLibsImports", () => {
    it("should generate sorted import statements", () => {
      const libs = [
        {
          id: "gfx",
          type: SaveLibraryTypeEnum.GRAPHICS,
          name: "Graphics",
          path: "@nanoforge/graphics",
        },
        {
          id: "ecs",
          type: SaveLibraryTypeEnum.COMPONENT_SYSTEM,
          name: "ECS",
          path: "@nanoforge/ecs",
        },
      ];
      const result = new MainGenerator().generateLibsImports(libs).toString();
      const lines = result.trim().split("\n");
      expect(lines[0]).toContain("@nanoforge/ecs");
      expect(lines[1]).toContain("@nanoforge/graphics");
    });
  });

  describe("generateLibsInstances", () => {
    it("should generate const declarations for each library", () => {
      const libs = [{ id: "gfx", type: SaveLibraryTypeEnum.GRAPHICS, name: "Graphics", path: "" }];
      const result = new MainGenerator().generateLibsInstances(libs).toString();
      expect(result).toContain("const gfx = new Graphics();");
    });
  });

  describe("generateLibsInit", () => {
    it("should use known init function for known library types", () => {
      const libs = [{ id: "gfx", type: SaveLibraryTypeEnum.GRAPHICS, name: "Graphics", path: "" }];
      const result = new MainGenerator().generateLibsInit(libs).toString();
      expect(result).toContain("app.useGraphics(gfx);");
    });

    it("should use app.use with Symbol for unknown library types", () => {
      const libs = [{ id: "custom", type: "custom-lib", name: "Custom", path: "" }];
      const result = new MainGenerator().generateLibsInit(libs).toString();
      expect(result).toContain('app.use(Symbol("custom-lib"), custom);');
    });
  });

  describe("generateRegistry", () => {
    it("should use component-system library id for registry", () => {
      const libs = [
        { id: "myEcs", type: SaveLibraryTypeEnum.COMPONENT_SYSTEM, name: "ECS", path: "" },
      ];
      const result = new MainGenerator().generateRegistry(libs).toString();
      expect(result).toContain("const registry = myEcs.registry;");
    });

    it("should fallback to ecsLibrary when no component-system lib is found", () => {
      const result = new MainGenerator().generateRegistry([]).toString();
      expect(result).toContain("const registry = ecsLibrary.registry;");
    });
  });

  describe("generateEntities", () => {
    it("should generate entity spawn and component additions", () => {
      const components = [
        {
          name: "Position",
          path: "non",
          paramsNames: ["x", "y"],
        },
        {
          name: "Velocity",
          path: "non",
          paramsNames: ["fast", "__RESERVED_ASSET_asset"],
        },
      ];
      const entities = [
        {
          id: "player",
          components: {
            Position: {
              x: 1,
              y: 2,
            },
            Velocity: {
              fast: 3,
              asset: "test",
            },
          },
        },
      ];
      const result = new MainGenerator().generateEntities([], components, entities).toString();
      expect(result).toContain("const player = registry.spawnEntity();");
      expect(result).toContain("registry.addComponent(player, new Position(1, 2));");
      expect(result).toContain(
        'registry.addComponent(player, new Velocity(3, assetManagerLibrary.getAsset("test")));',
      );
    });
  });

  describe("generateSystems", () => {
    it("should generate addSystem calls", () => {
      const systems = [
        { name: "PhysicsSystem", path: "" },
        { name: "RenderSystem", path: "" },
      ];
      const result = new MainGenerator().generateSystems(systems).toString();
      expect(result).toContain("registry.addSystem(PhysicsSystem);");
      expect(result).toContain("registry.addSystem(RenderSystem);");
    });
  });

  describe("generateInitFunctionIfNeeded", () => {
    it("should generate init function call when needed is true", () => {
      const result = new MainGenerator()
        .generateInitFunctionIfNeeded(true, "beforeInit" as any)
        .toString();
      expect(result).toContain("await beforeInit(app);");
    });

    it("should not generate anything when needed is false", () => {
      const result = new MainGenerator()
        .generateInitFunctionIfNeeded(false, "beforeInit" as any)
        .toString();
      expect(result).toBe("");
    });

    it("should pass registry param for registry init functions", () => {
      const result = new MainGenerator()
        .generateInitFunctionIfNeeded(true, "beforeRegistryInit" as any)
        .toString();
      expect(result).toContain("await beforeRegistryInit(app, registry);");
    });
  });

  describe("generateInitFunctionsImportsIfNeeded", () => {
    it("should generate all init function imports when needed", () => {
      const result = new MainGenerator().generateInitFunctionsImportsIfNeeded(true).toString();
      expect(result).toContain("afterInit");
      expect(result).toContain("afterRegistryInit");
      expect(result).toContain("afterRun");
      expect(result).toContain("beforeInit");
      expect(result).toContain("beforeRegistryInit");
      expect(result).toContain("beforeRun");
    });

    it("should not generate imports when not needed", () => {
      const result = new MainGenerator().generateInitFunctionsImportsIfNeeded(false).toString();
      expect(result).toBe("");
    });
  });
});
