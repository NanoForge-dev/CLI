import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runCli } from "./helpers/run-cli";

const tmpDir = resolve(__dirname, "../.tmp-e2e-new-config");

beforeAll(() => {
  mkdirSync(tmpDir, { recursive: true });
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("nf new config output (no server)", () => {
  const projectDir = resolve(tmpDir, "config-no-server");
  let config: any;

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });

    await runCli([
      "new",
      "--name",
      "config-test",
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

    config = JSON.parse(
      readFileSync(resolve(projectDir, "config-test/nanoforge.config.json"), "utf-8"),
    );
  });

  it("should have client config", () => {
    expect(config.client.enable).toBe(true);
  });

  it("should not have server enabled", () => {
    expect(config.server?.enable).not.toBe(true);
  });
});

describe("nf new config output (with server)", () => {
  const projectDir = resolve(tmpDir, "config-with-server");
  let config: any;

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });

    await runCli([
      "new",
      "--name",
      "server-test",
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

    config = JSON.parse(
      readFileSync(resolve(projectDir, "server-test/nanoforge.config.json"), "utf-8"),
    );
  });

  it("should have server enabled", () => {
    expect(config.server.enable).toBe(true);
  });

  it("should have client build config", () => {
    expect(config.client.enable).toBe(true);
  });
});

describe("nf new package.json output", () => {
  const projectDir = resolve(tmpDir, "pkg-test");
  let pkg: any;

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });

    await runCli([
      "new",
      "--name",
      "pkg-app",
      "--language",
      "ts",
      "--package-manager",
      "npm",
      "--strict",
      "--no-server",
      "--no-init-functions",
      "--skip-install",
      "--no-docker",
      "--editor",
      "--no-git",
      "-d",
      projectDir,
    ]);

    pkg = JSON.parse(readFileSync(resolve(projectDir, "pkg-app/package.json"), "utf-8"));
  });

  it("should have the correct project name", () => {
    expect(pkg.name).toBe("pkg-app");
  });

  it("should have nanoforge dependencies", () => {
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(allDeps).toHaveProperty("@nanoforge-dev/core");
    expect(allDeps).toHaveProperty("@nanoforge-dev/core-editor");
  });
});
