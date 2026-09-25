import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { writeStandaloneEntry } from "./helpers/project-fixtures";
import { runCli } from "./helpers/run-cli";

const tmpDir = resolve(__dirname, "../.tmp-e2e-build");

const newProject = (name: string, directory: string, server: boolean) =>
  runCli([
    "new",
    "--name",
    name,
    "--language",
    "ts",
    "--package-manager",
    "npm",
    "--strict",
    server ? "--server" : "--no-server",
    "--skip-install",
    "--no-docker",
    "--no-git",
    "-d",
    directory,
  ]);

beforeAll(async () => {
  mkdirSync(tmpDir, { recursive: true });
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("nf build (TypeScript, no server)", () => {
  const projectDir = resolve(tmpDir, "build-ts-no-server");
  const appDir = resolve(projectDir, "build-app");
  const outDir = resolve(appDir, "dist");

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });
    await newProject("build-app", projectDir, false);
    writeStandaloneEntry(appDir);
  });

  it("should run the build command", async () => {
    const { exitCode } = await runCli(["build", "-d", appDir]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(outDir, "main.js"))).toBe(true);
  });

  it("should accept --client-out-dir option", async () => {
    const { exitCode } = await runCli(["build", "-d", appDir, "--client-out-dir", "custom-out"]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(appDir, "custom-out", "main.js"))).toBe(true);
  });

  it("should accept --client-entry option", async () => {
    writeFileSync(resolve(appDir, "src", "other.ts"), 'console.log("other");\n');

    const { exitCode } = await runCli(["build", "-d", appDir, "--client-entry", "src/other.ts"]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(outDir, "other.js"))).toBe(true);
  });

  it("should copy assets to output dir", async () => {
    writeFileSync(resolve(appDir, "assets", "asset.txt"), "hello");

    const { exitCode } = await runCli(["build", "-d", appDir]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(outDir, "asset.txt"))).toBe(true);
  });

  it("should reset output dir before rebuild", async () => {
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
    expect(existsSync(resolve(outDir, "custom-asset.txt"))).toBe(true);
  });

  it("should keep process alive with --watch flag", async () => {
    const { killed } = await runCli(["build", "-d", appDir, "--watch"], { timeout: 3000 });
    expect(killed).toBe(true);
  });

  it("should accept --editor flag and use editor entry", async () => {
    const { exitCode } = await runCli(["build", "-d", appDir, "--editor"]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(outDir, "main.js"))).toBe(true);
  });
});

describe("nf build (TypeScript, with server)", () => {
  const projectDir = resolve(tmpDir, "build-ts-with-server");
  const workspaceDir = resolve(projectDir, "build-server-app");
  const clientDir = resolve(workspaceDir, "apps/client");
  const serverDir = resolve(workspaceDir, "apps/server");

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });
    await newProject("build-server-app", projectDir, true);
    writeStandaloneEntry(clientDir);
    writeStandaloneEntry(serverDir);
  });

  it("should build every project of the workspace", async () => {
    const { exitCode } = await runCli(["build", "-d", workspaceDir]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(clientDir, "dist", "main.js"))).toBe(true);
    expect(existsSync(resolve(serverDir, "dist", "main.js"))).toBe(true);
  });

  it("should build a single project of the workspace", async () => {
    rmSync(resolve(clientDir, "dist"), { recursive: true, force: true });

    const { exitCode } = await runCli(["build", "-d", serverDir]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(serverDir, "dist", "main.js"))).toBe(true);
    expect(existsSync(resolve(clientDir, "dist"))).toBe(false);
  });

  it("should accept --server-out-dir option", async () => {
    const { exitCode } = await runCli([
      "build",
      "-d",
      workspaceDir,
      "--server-out-dir",
      "custom-server-out",
    ]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(serverDir, "custom-server-out", "main.js"))).toBe(true);
    expect(existsSync(resolve(clientDir, "dist", "main.js"))).toBe(true);
  });

  it("should accept --server-static-dir option and copy files from it", async () => {
    const customStaticDir = resolve(serverDir, "custom-server-static");
    mkdirSync(customStaticDir, { recursive: true });
    writeFileSync(resolve(customStaticDir, "server-asset.txt"), "server");

    const { exitCode } = await runCli([
      "build",
      "-d",
      workspaceDir,
      "--server-static-dir",
      "custom-server-static",
    ]);

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(serverDir, "dist", "server-asset.txt"))).toBe(true);
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
