import { existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runCli } from "./helpers/run-cli";

const tmpDir = resolve(__dirname, "../.tmp-e2e-build");

beforeAll(async () => {
  mkdirSync(tmpDir, { recursive: true });
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("nf build (TypeScript, no server)", () => {
  const projectDir = resolve(tmpDir, "build-ts-no-server");
  const appDir = resolve(projectDir, "build-app");

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });

    await runCli([
      "new",
      "--name",
      "build-app",
      "--language",
      "ts",
      "--package-manager",
      "npm",
      "--strict",
      "--no-server",
      "--no-init-functions",
      "--no-skip-install",
      "--no-docker",
      "-d",
      projectDir,
    ]);
  });

  it("should run the build command", async () => {
    const { exitCode } = await runCli(["build", "-d", appDir]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(appDir, ".nanoforge", "client"))).toBe(true);
    expect(existsSync(resolve(appDir, ".nanoforge", "client", "main.js"))).toBe(true);
  });

  it("should accept --config option", async () => {
    const { exitCode } = await runCli(["build", "-d", appDir, "--config", "nanoforge.config.json"]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(appDir, ".nanoforge", "client", "main.js"))).toBe(true);
  });

  it("should accept --client-outDir option", async () => {
    const { exitCode } = await runCli(["build", "-d", appDir, "--client-outDir", "custom-out"]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(appDir, "custom-out"))).toBe(true);
    expect(existsSync(resolve(appDir, "custom-out", "main.js"))).toBe(true);
  });
});

describe("nf build (TypeScript, with server)", () => {
  const projectDir = resolve(tmpDir, "build-ts-with-server");
  const appDir = resolve(projectDir, "build-server-app");

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });

    await runCli([
      "new",
      "--name",
      "build-server-app",
      "--language",
      "ts",
      "--package-manager",
      "npm",
      "--no-strict",
      "--server",
      "--no-init-functions",
      "--no-skip-install",
      "--no-docker",
      "-d",
      projectDir,
    ]);
  });

  it("should run the build command with server enabled", async () => {
    const { exitCode } = await runCli(["build", "-d", appDir]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(appDir, ".nanoforge", "client", "main.js"))).toBe(true);
    expect(existsSync(resolve(appDir, ".nanoforge", "server", "main.js"))).toBe(true);
  });

  it("should accept --server-outDir option", async () => {
    const { exitCode } = await runCli([
      "build",
      "-d",
      appDir,
      "--server-outDir",
      "custom-server-out",
    ]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(appDir, "custom-server-out"))).toBe(true);
    expect(existsSync(resolve(appDir, "custom-server-out", "main.js"))).toBe(true);
  });
});

describe("nf build (with invalid directory)", () => {
  it("should fail when directory does not exist", async () => {
    const { exitCode } = await runCli(["build", "-d", resolve(tmpDir, "nonexistent")]);

    expect(exitCode).not.toBe(0);
  });

  it("should fail when no config file is found", async () => {
    const emptyDir = resolve(tmpDir, "empty-dir");
    mkdirSync(emptyDir, { recursive: true });

    const { exitCode } = await runCli(["build", "-d", emptyDir]);

    expect(exitCode).not.toBe(0);
  });
});
