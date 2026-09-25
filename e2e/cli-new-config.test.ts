import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runCli } from "./helpers/run-cli";

const tmpDir = resolve(__dirname, "../.tmp-e2e-new-config");

const newProject = (name: string, directory: string, extraArgs: string[]) =>
  runCli([
    "new",
    "--name",
    name,
    "--language",
    "ts",
    "--package-manager",
    "npm",
    "--strict",
    "--skip-install",
    "--no-docker",
    "--no-git",
    ...extraArgs,
    "-d",
    directory,
  ]);

beforeAll(() => {
  mkdirSync(tmpDir, { recursive: true });
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("nf new config output (no server)", () => {
  const projectDir = resolve(tmpDir, "config-no-server");
  let config: string;

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });
    await newProject("config-test", projectDir, ["--no-server"]);
    config = readFileSync(resolve(projectDir, "config-test/nanoforge.config.ts"), "utf-8");
  });

  it("should generate a client project config", () => {
    expect(config).toContain('type: "client"');
  });

  it("should use defineConfig from nanoforge", () => {
    expect(config).toContain('import { defineConfig } from "@nanoforge-dev/config";');
  });
});

describe("nf new config output (with server)", () => {
  const projectDir = resolve(tmpDir, "config-with-server");
  const workspaceDir = resolve(projectDir, "server-test");

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });
    await newProject("server-test", projectDir, ["--server"]);
  });

  it("should generate a workspace config including the apps", () => {
    const config = readFileSync(resolve(workspaceDir, "nanoforge.config.ts"), "utf-8");
    expect(config).toContain('type: "workspace"');
    expect(config).toContain('packages: ["apps/*"]');
  });

  it("should generate a client project config", () => {
    const config = readFileSync(resolve(workspaceDir, "apps/client/nanoforge.config.ts"), "utf-8");
    expect(config).toContain('type: "client"');
  });

  it("should generate a server project config", () => {
    const config = readFileSync(resolve(workspaceDir, "apps/server/nanoforge.config.ts"), "utf-8");
    expect(config).toContain('type: "server"');
  });
});

describe("nf new package.json output", () => {
  const projectDir = resolve(tmpDir, "pkg-test");
  let pkg: any;

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });
    await newProject("pkg-app", projectDir, ["--no-server", "--editor"]);
    pkg = JSON.parse(readFileSync(resolve(projectDir, "pkg-app/package.json"), "utf-8"));
  });

  it("should have the correct project name", () => {
    expect(pkg.name).toBe("pkg-app");
  });

  it("should have nanoforge dependencies", () => {
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(allDeps).toHaveProperty("@nanoforge-dev/core");
    expect(allDeps).toHaveProperty("@nanoforge-dev/config");
    expect(allDeps).toHaveProperty("@nanoforge-dev/ecs");
    expect(allDeps).toHaveProperty("@nanoforge-dev/graphics-2d");
  });

  // TODO: `--editor` does not add any editor dependency to the generated project yet.
  it.todo("should have editor dependencies with --editor");
});
