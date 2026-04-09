import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
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

  it("should accept --client-out-dir option", async () => {
    const { exitCode } = await runCli(["build", "-d", appDir, "--client-out-dir", "custom-out"]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(appDir, "custom-out"))).toBe(true);
    expect(existsSync(resolve(appDir, "custom-out", "main.js"))).toBe(true);
  });

  it("should copy static files to output dir", async () => {
    const staticDir = resolve(appDir, "client", "static");
    mkdirSync(staticDir, { recursive: true });
    writeFileSync(resolve(staticDir, "asset.txt"), "hello");

    const { exitCode } = await runCli(["build", "-d", appDir]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(appDir, ".nanoforge", "client", "asset.txt"))).toBe(true);
  });

  it("should reset output dir before rebuild", async () => {
    const outDir = resolve(appDir, ".nanoforge", "client");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "stale.js"), "// stale");

    const { exitCode } = await runCli(["build", "-d", appDir]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(outDir, "stale.js"))).toBe(false);
    expect(existsSync(resolve(outDir, "main.js"))).toBe(true);
  });

  it("should accept --client-static-dir option and copy files from it", async () => {
    const customStaticDir = resolve(appDir, "custom-static");
    mkdirSync(customStaticDir, { recursive: true });
    writeFileSync(resolve(customStaticDir, "custom-asset.txt"), "custom");

    const { exitCode } = await runCli([
      "build",
      "-d",
      appDir,
      "--client-static-dir",
      "custom-static",
    ]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(appDir, ".nanoforge", "client", "custom-asset.txt"))).toBe(true);
  });

  it("should keep process alive with --watch flag", async () => {
    const { killed } = await runCli(["build", "-d", appDir, "--watch"], { timeout: 3000 });

    expect(killed).toBe(true);
  });

  it("should accept --editor flag and use editor entry", async () => {
    const editorEntryDir = resolve(appDir, ".nanoforge", "editor", "client");
    mkdirSync(editorEntryDir, { recursive: true });
    writeFileSync(resolve(editorEntryDir, "main.ts"), 'console.log("editor");');

    const { exitCode } = await runCli(["build", "-d", appDir, "--editor"]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(appDir, ".nanoforge", "client", "main.js"))).toBe(true);
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

  it("should accept --server-out-dir option", async () => {
    const { exitCode } = await runCli([
      "build",
      "-d",
      appDir,
      "--server-out-dir",
      "custom-server-out",
    ]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(appDir, "custom-server-out"))).toBe(true);
    expect(existsSync(resolve(appDir, "custom-server-out", "main.js"))).toBe(true);
  });

  it("should accept --server-static-dir option and copy files from it", async () => {
    const customStaticDir = resolve(appDir, "custom-server-static");
    mkdirSync(customStaticDir, { recursive: true });
    writeFileSync(resolve(customStaticDir, "server-asset.txt"), "server");

    const { exitCode } = await runCli([
      "build",
      "-d",
      appDir,
      "--server-static-dir",
      "custom-server-static",
    ]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(appDir, ".nanoforge", "server", "server-asset.txt"))).toBe(true);
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
