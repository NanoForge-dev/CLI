import { existsSync, mkdirSync, readFileSync, rmSync } from "fs";
import { resolve } from "path";
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
  const appDir = resolve(projectDir, "ts-app");

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
      "--skip-install",
      "--no-docker",
      "--no-git",
      "-d",
      projectDir,
    ]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("NanoForge Project Creation");
    expect(stdout).toContain("Project successfully created");
  });

  it("should create the project directory", () => {
    expect(existsSync(appDir)).toBe(true);
  });

  it("should generate a client nanoforge.config.ts", () => {
    const configPath = resolve(appDir, "nanoforge.config.ts");
    expect(existsSync(configPath)).toBe(true);
    expect(readFileSync(configPath, "utf-8")).toContain('type: "client"');
  });

  it("should generate package.json", () => {
    const pkg = JSON.parse(readFileSync(resolve(appDir, "package.json"), "utf-8"));
    expect(pkg.name).toBe("ts-app");
  });

  it("should generate tsconfig.json for TypeScript", () => {
    expect(existsSync(resolve(appDir, "tsconfig.json"))).toBe(true);
  });

  it("should generate the client entry file", () => {
    expect(existsSync(resolve(appDir, "src/main.ts"))).toBe(true);
  });

  it("should generate components and systems", () => {
    expect(existsSync(resolve(appDir, "src/components"))).toBe(true);
    expect(existsSync(resolve(appDir, "src/systems"))).toBe(true);
  });

  it("should not generate a workspace", () => {
    expect(existsSync(resolve(appDir, "apps"))).toBe(false);
  });

  it("should not generate docker files", () => {
    expect(existsSync(resolve(appDir, "Dockerfile"))).toBe(false);
  });
});

describe("nf new (with dependencies installation)", () => {
  // TODO: enable once the engine v2 packages (`@nanoforge-dev/ecs`, `@nanoforge-dev/network`
  //  and `nanoforge`) are published on npm, installing a generated project fails until then.
  it.skip("should install the project dependencies", async () => {
    const projectDir = resolve(tmpDir, "with-install");
    mkdirSync(projectDir, { recursive: true });

    const { exitCode } = await runCli([
      "new",
      "--name",
      "install-app",
      "--language",
      "ts",
      "--package-manager",
      "npm",
      "--strict",
      "--no-server",
      "--no-skip-install",
      "--no-docker",
      "--no-git",
      "-d",
      projectDir,
    ]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(projectDir, "install-app/node_modules"))).toBe(true);
  });
});

describe("nf new (JavaScript, with server)", () => {
  const projectDir = resolve(tmpDir, "js-with-server");
  const workspaceDir = resolve(projectDir, "js-game");

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
      "--skip-install",
      "--no-docker",
      "--no-git",
      "-d",
      projectDir,
    ]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("Project successfully created");
  });

  it("should generate a workspace nanoforge.config.js", () => {
    const content = readFileSync(resolve(workspaceDir, "nanoforge.config.js"), "utf-8");
    expect(content).toContain('type: "workspace"');
    expect(content).toContain('packages: ["apps/*"]');
  });

  it("should generate a pnpm workspace", () => {
    expect(existsSync(resolve(workspaceDir, "pnpm-workspace.yaml"))).toBe(true);
  });

  it("should generate the client project", () => {
    const content = readFileSync(resolve(workspaceDir, "apps/client/nanoforge.config.js"), "utf-8");
    expect(content).toContain('type: "client"');
    expect(existsSync(resolve(workspaceDir, "apps/client/src/main.js"))).toBe(true);
  });

  it("should generate the server project", () => {
    const content = readFileSync(resolve(workspaceDir, "apps/server/nanoforge.config.js"), "utf-8");
    expect(content).toContain('type: "server"');
    expect(existsSync(resolve(workspaceDir, "apps/server/src/main.js"))).toBe(true);
  });

  it("should generate jsconfig.json instead of tsconfig.json", () => {
    expect(existsSync(resolve(workspaceDir, "jsconfig.json"))).toBe(true);
    expect(existsSync(resolve(workspaceDir, "tsconfig.json"))).toBe(false);
    expect(existsSync(resolve(workspaceDir, "apps/client/jsconfig.json"))).toBe(true);
    expect(existsSync(resolve(workspaceDir, "apps/server/jsconfig.json"))).toBe(true);
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
      "--skip-install",
      "--no-docker",
      "--no-git",
      "-d",
      projectDir,
    ]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("Project successfully created");
  });

  it("should create the project in the custom path", () => {
    expect(existsSync(resolve(projectDir, "custom/subdir/nanoforge.config.ts"))).toBe(true);
    expect(existsSync(resolve(projectDir, "path-app"))).toBe(false);
  });
});

describe("nf new (with typescript with docker option)", () => {
  const projectDir = resolve(tmpDir, "ts-with-docker");
  const appDir = resolve(projectDir, "ts-app");

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
      "--skip-install",
      "--docker",
      "--no-git",
      "-d",
      projectDir,
    ]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("NanoForge Project Creation");
    expect(stdout).toContain("Project successfully created");
  });

  it("should generate the project", () => {
    expect(existsSync(resolve(appDir, "nanoforge.config.ts"))).toBe(true);
    expect(existsSync(resolve(appDir, "src/main.ts"))).toBe(true);
  });

  it("should generate Dockerfile", () => {
    expect(existsSync(resolve(appDir, "Dockerfile"))).toBe(true);
  });

  it("should generate .dockerignore", () => {
    expect(existsSync(resolve(appDir, ".dockerignore"))).toBe(true);
  });
});
