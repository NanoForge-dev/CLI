import { existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runCli } from "./helpers/run-cli";

const tmpDir = resolve(__dirname, "../.tmp-e2e-create");

const newProject = (name: string, directory: string, language: "ts" | "js", server: boolean) =>
  runCli([
    "new",
    "--name",
    name,
    "--language",
    language,
    "--package-manager",
    "npm",
    "--no-strict",
    server ? "--server" : "--no-server",
    "--skip-install",
    "--no-docker",
    "--no-git",
    "-d",
    directory,
  ]);

beforeAll(() => {
  mkdirSync(tmpDir, { recursive: true });
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("nf create (TypeScript, client project)", () => {
  const projectDir = resolve(tmpDir, "create-ts-client");
  const appDir = resolve(projectDir, "create-app");

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });
    await newProject("create-app", projectDir, "ts", false);
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

  it("should generate a component file in src/components", () => {
    expect(existsSync(resolve(appDir, "src/components/player.component.ts"))).toBe(true);
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

  it("should generate a system file in src/systems", () => {
    expect(existsSync(resolve(appDir, "src/systems/movement.system.ts"))).toBe(true);
  });

  it("should create a component with a custom path via --path", async () => {
    const { exitCode } = await runCli([
      "create",
      "component",
      "--name",
      "custom",
      "--path",
      "src/custom-components",
      "-d",
      appDir,
    ]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(appDir, "src/custom-components/custom.component.ts"))).toBe(true);
  });
});

describe("nf create (TypeScript, server project in a workspace)", () => {
  const projectDir = resolve(tmpDir, "create-ts-server");
  const workspaceDir = resolve(projectDir, "create-server-app");
  const serverDir = resolve(workspaceDir, "apps/server");

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });
    await newProject("create-server-app", projectDir, "ts", true);
  });

  it("should create a server component successfully", async () => {
    const { exitCode } = await runCli([
      "create",
      "component",
      "--name",
      "network",
      "-d",
      serverDir,
    ]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(serverDir, "src/components/network.component.ts"))).toBe(true);
  });

  it("should create a server system successfully", async () => {
    const { exitCode } = await runCli(["create", "system", "--name", "sync", "-d", serverDir]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(serverDir, "src/systems/sync.system.ts"))).toBe(true);
  });

  it("should fail when run at the workspace root", async () => {
    const { exitCode } = await runCli([
      "create",
      "component",
      "--name",
      "root",
      "-d",
      workspaceDir,
    ]);

    expect(exitCode).not.toBe(0);
    expect(existsSync(resolve(workspaceDir, "src/components/root.component.ts"))).toBe(false);
  });
});

describe("nf create (JavaScript)", () => {
  const projectDir = resolve(tmpDir, "create-js");
  const appDir = resolve(projectDir, "create-js-app");

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });
    await newProject("create-js-app", projectDir, "js", false);
  });

  it("should create a JavaScript component successfully", async () => {
    const { exitCode } = await runCli(["create", "component", "--name", "sprite", "-d", appDir]);
    expect(exitCode).toBe(0);
  });

  it("should generate a .js component file", () => {
    expect(existsSync(resolve(appDir, "src/components/sprite.component.js"))).toBe(true);
  });

  it("should create a JavaScript system successfully", async () => {
    const { exitCode } = await runCli(["create", "system", "--name", "render", "-d", appDir]);
    expect(exitCode).toBe(0);
  });

  it("should generate a .js system file", () => {
    expect(existsSync(resolve(appDir, "src/systems/render.system.js"))).toBe(true);
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
    const appDir = resolve(tmpDir, "create-ts-client/create-app");
    const { exitCode } = await runCli(["create", "invalid-type", "--name", "test", "-d", appDir]);
    expect(exitCode).not.toBe(0);
  });
});
