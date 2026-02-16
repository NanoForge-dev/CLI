import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runCli } from "./helpers/run-cli";

const tmpDir = resolve(__dirname, "../.tmp-e2e-new");

beforeAll(() => {
  mkdirSync(tmpDir, { recursive: true });
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("nf new (TypeScript, no server)", () => {
  const projectDir = resolve(tmpDir, "ts-no-server");

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });
  });

  it("should create a project successfully", async () => {
    const { stdout, exitCode } = await runCli([
      "new",
      "--name",
      "ts-app",
      "--language",
      "ts",
      "--package-manager",
      "npm",
      "--strict",
      "--no-server",
      "--no-init-functions",
      "--skip-install",
      "-d",
      projectDir,
    ]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("NanoForge Project Creation");
    expect(stdout).toContain("Project successfully created");
  });

  it("should create the project directory", () => {
    expect(existsSync(resolve(projectDir, "ts-app"))).toBe(true);
  });

  it("should generate nanoforge.config.json", () => {
    const configPath = resolve(projectDir, "ts-app/nanoforge.config.json");
    expect(existsSync(configPath)).toBe(true);

    const config = JSON.parse(readFileSync(configPath, "utf-8"));
    expect(config.client).toBeDefined();
    expect(config.client.build.entryFile).toBe("client/main.ts");
  });

  it("should generate package.json", () => {
    expect(existsSync(resolve(projectDir, "ts-app/package.json"))).toBe(true);
  });

  it("should generate tsconfig.json for TypeScript", () => {
    expect(existsSync(resolve(projectDir, "ts-app/tsconfig.json"))).toBe(true);
  });

  it("should generate client directory", () => {
    expect(existsSync(resolve(projectDir, "ts-app/client"))).toBe(true);
  });

  it("should generate client main file", () => {
    expect(existsSync(resolve(projectDir, "ts-app/client/main.ts"))).toBe(true);
  });

  it("should not generate server directory", () => {
    expect(existsSync(resolve(projectDir, "ts-app/server"))).toBe(false);
  });

  it("should not have server enabled in config", () => {
    const configPath = resolve(projectDir, "ts-app/nanoforge.config.json");
    const config = JSON.parse(readFileSync(configPath, "utf-8"));
    expect(config.server?.enable).not.toBe(true);
  });
});

describe("nf new (JavaScript, with server)", () => {
  const projectDir = resolve(tmpDir, "js-with-server");

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });
  });

  it("should create a project with server successfully", async () => {
    const { stdout, exitCode } = await runCli([
      "new",
      "--name",
      "js-game",
      "--language",
      "js",
      "--package-manager",
      "pnpm",
      "--no-strict",
      "--server",
      "--init-functions",
      "--skip-install",
      "-d",
      projectDir,
    ]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("Project successfully created");
  });

  it("should generate server directory", () => {
    expect(existsSync(resolve(projectDir, "js-game/server"))).toBe(true);
  });

  it("should generate server main file as .js", () => {
    expect(existsSync(resolve(projectDir, "js-game/server/main.js"))).toBe(true);
  });

  it("should generate client main file as .js", () => {
    expect(existsSync(resolve(projectDir, "js-game/client/main.js"))).toBe(true);
  });

  it("should have server enabled in config", () => {
    const configPath = resolve(projectDir, "js-game/nanoforge.config.json");
    const config = JSON.parse(readFileSync(configPath, "utf-8"));
    expect(config.server.enable).toBe(true);
  });

  it("should generate init function files for client", () => {
    expect(existsSync(resolve(projectDir, "js-game/client/init/before-init.js"))).toBe(true);
    expect(existsSync(resolve(projectDir, "js-game/client/init/after-init.js"))).toBe(true);
  });

  it("should generate init function files for server", () => {
    expect(existsSync(resolve(projectDir, "js-game/server/init/before-init.js"))).toBe(true);
    expect(existsSync(resolve(projectDir, "js-game/server/init/after-init.js"))).toBe(true);
  });

  it("should generate jsconfig.json instead of tsconfig.json", () => {
    expect(existsSync(resolve(projectDir, "js-game/jsconfig.json"))).toBe(true);
    expect(existsSync(resolve(projectDir, "js-game/tsconfig.json"))).toBe(false);
  });

  it("should generate save files in .nanoforge", () => {
    expect(existsSync(resolve(projectDir, "js-game/.nanoforge/client.save.json"))).toBe(true);
    expect(existsSync(resolve(projectDir, "js-game/.nanoforge/server.save.json"))).toBe(true);
  });
});

describe("nf new (with --path option)", () => {
  const projectDir = resolve(tmpDir, "with-path");

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });
  });

  it("should create a project in a custom path", async () => {
    const { stdout, exitCode } = await runCli([
      "new",
      "--name",
      "path-app",
      "--path",
      "custom/subdir",
      "--language",
      "ts",
      "--package-manager",
      "npm",
      "--strict",
      "--no-server",
      "--no-init-functions",
      "--skip-install",
      "-d",
      projectDir,
    ]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("Project successfully created");
  });

  it("should create the project in the custom path", () => {
    expect(existsSync(resolve(projectDir, "custom/subdir"))).toBe(true);
  });
});
