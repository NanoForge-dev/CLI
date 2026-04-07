import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runCli } from "./helpers/run-cli";

const tmpDir = resolve(__dirname, "../.tmp-e2e-generate");

beforeAll(async () => {
  mkdirSync(tmpDir, { recursive: true });
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("nf generate (TypeScript, no server)", () => {
  const projectDir = resolve(tmpDir, "gen-ts-no-server");
  const appDir = resolve(projectDir, "gen-app");

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });

    await runCli([
      "new",
      "--name",
      "gen-app",
      "--language",
      "ts",
      "--package-manager",
      "npm",
      "--strict",
      "--no-server",
      "--init-functions",
      "--skip-install",
      "--no-docker",
      "-d",
      projectDir,
    ]);
  });

  it("should run the generate command", async () => {
    const { exitCode } = await runCli(["generate", "-d", appDir]);

    expect(exitCode).toBe(0);
  });

  it("should accept --config option", async () => {
    const { exitCode } = await runCli([
      "generate",
      "-d",
      appDir,
      "--config",
      "nanoforge.config.json",
    ]);

    expect(exitCode).toBe(0);
  });

  it("should generate client main.ts file", async () => {
    const { exitCode } = await runCli(["generate", "-d", appDir]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(appDir, "client/main.ts"))).toBe(true);
  });

  it("should generate valid TypeScript client main content", async () => {
    await runCli(["generate", "-d", appDir]);

    const content = readFileSync(resolve(appDir, "client/main.ts"), "utf-8");

    // Core imports
    expect(content).toContain('import { type IRunOptions } from "@nanoforge-dev/common"');
    expect(content).toContain('import { NanoforgeFactory } from "@nanoforge-dev/core"');

    // Library imports
    expect(content).toContain('import { AssetManagerLibrary } from "@nanoforge-dev/asset-manager"');
    expect(content).toContain('import { ECSClientLibrary } from "@nanoforge-dev/ecs-client"');
    expect(content).toContain('import { Graphics2DLibrary } from "@nanoforge-dev/graphics-2d"');
    expect(content).toContain('import { InputLibrary } from "@nanoforge-dev/input"');
    expect(content).toContain('import { MusicLibrary } from "@nanoforge-dev/music"');
    expect(content).toContain('import { SoundLibrary } from "@nanoforge-dev/sound"');

    // Main function signature with TypeScript type
    expect(content).toContain("export async function main(options: IRunOptions)");

    // Factory creates client
    expect(content).toContain("NanoforgeFactory.createClient()");

    // App lifecycle
    expect(content).toContain("await app.init(options)");
    expect(content).toContain("await app.run()");
  });

  it("should generate init function imports and calls", async () => {
    await runCli(["generate", "-d", appDir]);

    const content = readFileSync(resolve(appDir, "client/main.ts"), "utf-8");

    // Init function imports
    expect(content).toContain('import { afterInit } from "./init/after-init"');
    expect(content).toContain('import { beforeInit } from "./init/before-init"');
    expect(content).toContain('import { afterRegistryInit } from "./init/after-registry-init"');
    expect(content).toContain('import { beforeRegistryInit } from "./init/before-registry-init"');
    expect(content).toContain('import { afterRun } from "./init/after-run"');
    expect(content).toContain('import { beforeRun } from "./init/before-run"');

    // Init function calls
    expect(content).toContain("await beforeInit(app)");
    expect(content).toContain("await afterInit(app)");
    expect(content).toContain("await beforeRun(app)");
    expect(content).toContain("await afterRun(app)");
    expect(content).toContain("await beforeRegistryInit(app, registry)");
    expect(content).toContain("await afterRegistryInit(app, registry)");
  });

  it("should generate library instantiation and registration", async () => {
    await runCli(["generate", "-d", appDir]);

    const content = readFileSync(resolve(appDir, "client/main.ts"), "utf-8");

    // Library instantiation
    expect(content).toContain("const assetManagerLibrary = new AssetManagerLibrary()");
    expect(content).toContain("const ecsLibrary = new ECSClientLibrary()");
    expect(content).toContain("const graphicsLibrary = new Graphics2DLibrary()");
    expect(content).toContain("const inputLibrary = new InputLibrary()");
    expect(content).toContain("const musicLibrary = new MusicLibrary()");
    expect(content).toContain("const soundLibrary = new SoundLibrary()");

    // Library registration
    expect(content).toContain("app.useAssetManager(assetManagerLibrary)");
    expect(content).toContain("app.useComponentSystem(ecsLibrary)");
    expect(content).toContain("app.useGraphics(graphicsLibrary)");
    expect(content).toContain("app.useInput(inputLibrary)");
    expect(content).toContain("app.useSound(soundLibrary)");
  });

  it("should generate ECS components, systems, and entities", async () => {
    await runCli(["generate", "-d", appDir]);

    const content = readFileSync(resolve(appDir, "client/main.ts"), "utf-8");

    // Component and system imports
    expect(content).toContain('import { ExampleComponent } from "./components/example.component"');
    expect(content).toContain('import { exampleSystem } from "./systems/example.system"');

    // Registry access
    expect(content).toContain("const registry = ecsLibrary.registry");

    // Entity creation and component attachment
    expect(content).toContain("const exampleEntity = registry.spawnEntity()");
    expect(content).toContain(
      'registry.addComponent(exampleEntity, new ExampleComponent("example", 10, undefined))',
    );

    // System registration
    expect(content).toContain("registry.addSystem(exampleSystem)");
  });

  it("should regenerate main.ts with modified save file (add component and entity)", async () => {
    const savePath = resolve(appDir, ".nanoforge/client.save.json");
    const save = JSON.parse(readFileSync(savePath, "utf-8"));

    save.components.push({
      name: "HealthComponent",
      path: "./components/health.component",
      paramsNames: ["health"],
    });

    save.entities[0].components["HealthComponent"] = { health: 100 };

    save.entities.push({
      id: "exampleEntity2",
      components: {
        ExampleComponent: {
          paramA: "example2",
          paramB: 15,
        },
      },
    });

    writeFileSync(savePath, JSON.stringify(save, null, 2));

    const { exitCode } = await runCli(["generate", "-d", appDir]);
    expect(exitCode).toBe(0);

    const content = readFileSync(resolve(appDir, "client/main.ts"), "utf-8");

    expect(content).toContain('import { HealthComponent } from "./components/health.component"');
    expect(content).toContain("new HealthComponent(100)");

    expect(content).toContain("const exampleEntity2 = registry.spawnEntity()");
    expect(content).toContain(
      'registry.addComponent(exampleEntity2, new ExampleComponent("example2", 15, undefined))',
    );

    // Original component should still be present

    expect(content).toContain('import { ExampleComponent } from "./components/example.component"');
    expect(content).toContain("const exampleEntity = registry.spawnEntity()");
    expect(content).toContain(
      'registry.addComponent(exampleEntity, new ExampleComponent("example", 10, undefined))',
    );
  });

  it("should not generate server directory", async () => {
    expect(existsSync(resolve(appDir, "server"))).toBe(false);
  });

  it("should generate client editor main.ts", async () => {
    await runCli(["generate", "-d", appDir, "--editor"]);

    const content = readFileSync(resolve(appDir, ".nanoforge/editor/client/main.ts"), "utf-8");

    expect(content).toContain("NanoforgeFactory.createClient()");
    expect(content).toContain('import { ECSClientLibrary } from "@nanoforge-dev/ecs-client"');
    expect(content).toContain('from "@nanoforge-dev/core-editor"');
  });
});

describe("nf generate (TypeScript, with server)", () => {
  const projectDir = resolve(tmpDir, "gen-ts-with-server");
  const appDir = resolve(projectDir, "gen-server-app");

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });

    await runCli([
      "new",
      "--name",
      "gen-server-app",
      "--language",
      "ts",
      "--package-manager",
      "npm",
      "--no-strict",
      "--server",
      "--init-functions",
      "--skip-install",
      "--no-docker",
      "-d",
      projectDir,
    ]);
  });

  it("should run the generate command with server enabled", async () => {
    const { exitCode } = await runCli(["generate", "-d", appDir]);

    expect(exitCode).toBe(0);
  });

  it("should generate server main.ts file", async () => {
    await runCli(["generate", "-d", appDir]);

    expect(existsSync(resolve(appDir, "server/main.ts"))).toBe(true);
  });

  it("should generate valid TypeScript server main content", async () => {
    await runCli(["generate", "-d", appDir]);

    const content = readFileSync(resolve(appDir, "server/main.ts"), "utf-8");

    // Core imports
    expect(content).toContain('import { type IRunOptions } from "@nanoforge-dev/common"');
    expect(content).toContain('import { NanoforgeFactory } from "@nanoforge-dev/core"');

    // Server-specific library
    expect(content).toContain('import { ECSServerLibrary } from "@nanoforge-dev/ecs-server"');

    // Factory creates server (not client)
    expect(content).toContain("NanoforgeFactory.createServer()");
    expect(content).not.toContain("NanoforgeFactory.createClient()");

    // Main function signature
    expect(content).toContain("export async function main(options: IRunOptions)");

    // App lifecycle
    expect(content).toContain("await app.init(options)");
    expect(content).toContain("await app.run()");
  });

  it("should generate server init function imports and calls", async () => {
    await runCli(["generate", "-d", appDir]);

    const content = readFileSync(resolve(appDir, "server/main.ts"), "utf-8");

    expect(content).toContain('import { beforeInit } from "./init/before-init"');
    expect(content).toContain('import { afterInit } from "./init/after-init"');
    expect(content).toContain("await beforeInit(app)");
    expect(content).toContain("await afterInit(app)");
  });

  it("should generate server ECS setup", async () => {
    await runCli(["generate", "-d", appDir]);

    const content = readFileSync(resolve(appDir, "server/main.ts"), "utf-8");

    expect(content).toContain("const ecsLibrary = new ECSServerLibrary()");
    expect(content).toContain("app.useComponentSystem(ecsLibrary)");
    expect(content).toContain("const registry = ecsLibrary.registry");
    expect(content).toContain("const exampleEntity = registry.spawnEntity()");
    expect(content).toContain("registry.addSystem(exampleSystem)");
  });

  it("should regenerate server main.ts with modified save file (add system)", async () => {
    const savePath = resolve(appDir, ".nanoforge/server.save.json");
    const save = JSON.parse(readFileSync(savePath, "utf-8"));

    save.systems.push({
      name: "movementSystem",
      path: "./systems/movement.system",
    });

    writeFileSync(savePath, JSON.stringify(save, null, 2));

    const { exitCode } = await runCli(["generate", "-d", appDir]);
    expect(exitCode).toBe(0);

    const content = readFileSync(resolve(appDir, "server/main.ts"), "utf-8");

    expect(content).toContain('import { movementSystem } from "./systems/movement.system"');
    expect(content).toContain("registry.addSystem(movementSystem)");
    // Original system should still be present
    expect(content).toContain('import { exampleSystem } from "./systems/example.system"');
    expect(content).toContain("registry.addSystem(exampleSystem)");
  });

  it("should also regenerate client main.ts", async () => {
    await runCli(["generate", "-d", appDir]);

    const content = readFileSync(resolve(appDir, "client/main.ts"), "utf-8");

    expect(content).toContain("NanoforgeFactory.createClient()");
    expect(content).toContain('import { ECSClientLibrary } from "@nanoforge-dev/ecs-client"');
  });
});

describe("nf generate (with invalid directory)", () => {
  it("should fail when directory does not exist", async () => {
    const { exitCode } = await runCli(["generate", "-d", resolve(tmpDir, "nonexistent")]);

    expect(exitCode).not.toBe(0);
  });

  it("should fail when no config file is found", async () => {
    const emptyDir = resolve(tmpDir, "empty-dir");
    mkdirSync(emptyDir, { recursive: true });

    const { exitCode } = await runCli(["generate", "-d", emptyDir]);

    expect(exitCode).not.toBe(0);
  });
});
