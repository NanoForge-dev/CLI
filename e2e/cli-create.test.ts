import { existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runCli } from "./helpers/run-cli";

const tmpDir = resolve(__dirname, "../.tmp-e2e-create");

beforeAll(() => {
  mkdirSync(tmpDir, { recursive: true });
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("nf create (TypeScript, client component)", () => {
  const projectDir = resolve(tmpDir, "create-ts-client");
  const appDir = resolve(projectDir, "create-app");

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });

    await runCli([
      "new",
      "--name",
      "create-app",
      "--language",
      "ts",
      "--package-manager",
      "npm",
      "--strict",
      "--no-server",
      "--no-init-functions",
      "--skip-install",
      "--no-docker",
      "--no-git",
      "-d",
      projectDir,
    ]);
  });

  it("should create a component successfully", async () => {
    const { stdout, exitCode } = await runCli([
      "create",
      "component",
      "--name",
      "player",
      "-d",
      appDir,
    ]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("NanoForge Component/System Creation");
    expect(stdout).toContain("Element successfully created");
  });

  it("should generate a component file in client/components", () => {
    expect(existsSync(resolve(appDir, "client/components/player.component.ts"))).toBe(true);
  });

  it("should create a system successfully", async () => {
    const { stdout, exitCode } = await runCli([
      "create",
      "system",
      "--name",
      "movement",
      "-d",
      appDir,
    ]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("Element successfully created");
  });

  it("should generate a system file in client/systems", () => {
    expect(existsSync(resolve(appDir, "client/systems/movement.system.ts"))).toBe(true);
  });

  it("should accept --config option", async () => {
    const { exitCode } = await runCli([
      "create",
      "component",
      "--name",
      "health",
      "--config",
      "nanoforge.config.json",
      "-d",
      appDir,
    ]);

    expect(exitCode).toBe(0);
  });

  it("should create a component with a custom path via --path", async () => {
    const { exitCode } = await runCli([
      "create",
      "component",
      "--name",
      "custom",
      "--path",
      "client/custom-components",
      "-d",
      appDir,
    ]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(appDir, "client/custom-components/custom.component.ts"))).toBe(true);
  });
});

describe("nf create (TypeScript, server component)", () => {
  const projectDir = resolve(tmpDir, "create-ts-server");
  const appDir = resolve(projectDir, "create-server-app");

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });

    await runCli([
      "new",
      "--name",
      "create-server-app",
      "--language",
      "ts",
      "--package-manager",
      "npm",
      "--no-strict",
      "--server",
      "--no-init-functions",
      "--skip-install",
      "--no-docker",
      "--no-git",
      "-d",
      projectDir,
    ]);
  });

  it("should create a server component successfully", async () => {
    const { exitCode } = await runCli([
      "create",
      "component",
      "--name",
      "enemy",
      "--server",
      "-d",
      appDir,
    ]);

    expect(exitCode).toBe(0);
  });

  it("should generate a component file in server/components", () => {
    expect(existsSync(resolve(appDir, "server/components/enemy.component.ts"))).toBe(true);
  });

  it("should create a server system successfully", async () => {
    const { exitCode } = await runCli([
      "create",
      "system",
      "--name",
      "physics",
      "--server",
      "-d",
      appDir,
    ]);

    expect(exitCode).toBe(0);
  });

  it("should generate a system file in server/systems", () => {
    expect(existsSync(resolve(appDir, "server/systems/physics.system.ts"))).toBe(true);
  });

  it("should create a server component with a custom path via --path", async () => {
    const { exitCode } = await runCli([
      "create",
      "component",
      "--name",
      "network",
      "--server",
      "--path",
      "server/custom-components",
      "-d",
      appDir,
    ]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(appDir, "server/custom-components/network.component.ts"))).toBe(true);
  });
});

describe("nf create (JavaScript)", () => {
  const projectDir = resolve(tmpDir, "create-js");
  const appDir = resolve(projectDir, "create-js-app");

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });

    await runCli([
      "new",
      "--name",
      "create-js-app",
      "--language",
      "js",
      "--package-manager",
      "npm",
      "--no-strict",
      "--no-server",
      "--no-init-functions",
      "--skip-install",
      "--no-docker",
      "--no-git",
      "-d",
      projectDir,
    ]);
  });

  it("should create a JavaScript component successfully", async () => {
    const { exitCode } = await runCli(["create", "component", "--name", "sprite", "-d", appDir]);

    expect(exitCode).toBe(0);
  });

  it("should generate a .js component file", () => {
    expect(existsSync(resolve(appDir, "client/components/sprite.component.js"))).toBe(true);
  });

  it("should create a JavaScript system successfully", async () => {
    const { exitCode } = await runCli(["create", "system", "--name", "render", "-d", appDir]);

    expect(exitCode).toBe(0);
  });

  it("should generate a .js system file", () => {
    expect(existsSync(resolve(appDir, "client/systems/render.system.js"))).toBe(true);
  });
});

describe("nf create (error cases)", () => {
  it("should fail when directory does not exist", async () => {
    const { exitCode } = await runCli([
      "create",
      "component",
      "--name",
      "test",
      "-d",
      resolve(tmpDir, "nonexistent"),
    ]);

    expect(exitCode).not.toBe(0);
  });

  it("should fail with an invalid type", async () => {
    const projectDir = resolve(tmpDir, "create-ts-client");
    const appDir = resolve(projectDir, "create-app");

    const { exitCode } = await runCli(["create", "invalid-type", "--name", "test", "-d", appDir]);

    expect(exitCode).not.toBe(0);
  });
});
