import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runCli } from "./helpers/run-cli";

const tmpDir = resolve(__dirname, "../.tmp-e2e-install");

beforeAll(async () => {
  mkdirSync(tmpDir, { recursive: true });
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("nf install (with existing project)", () => {
  const projectDir = resolve(tmpDir, "install-project");
  const appDir = resolve(projectDir, "install-app");

  beforeAll(() => {
    // `install -l` only needs a package.json: a generated project cannot be used until the
    // engine v2 packages it depends on are published on npm.
    mkdirSync(appDir, { recursive: true });
    writeFileSync(
      resolve(appDir, "package.json"),
      JSON.stringify({ name: "install-app", private: true }, null, 2),
    );
  });

  it("should run the install command with a library name", async () => {
    const { exitCode } = await runCli([
      "install",
      "-l",
      "@nanoforge-dev/network-client",
      "-d",
      appDir,
    ]);

    expect(exitCode).toBe(0);

    const pkgJson = JSON.parse(readFileSync(resolve(appDir, "package.json"), "utf-8"));
    expect(pkgJson.devDependencies).toHaveProperty("@nanoforge-dev/network-client");
    expect(existsSync(resolve(appDir, "node_modules", "@nanoforge-dev", "network-client"))).toBe(
      true,
    );
  });

  it("should run the install command with multiple library names", async () => {
    const { exitCode } = await runCli([
      "install",
      "-l",
      "@nanoforge-dev/network-client",
      "@nanoforge-dev/network-server",
      "-d",
      appDir,
    ]);

    expect(exitCode).toBe(0);

    const pkgJson = JSON.parse(readFileSync(resolve(appDir, "package.json"), "utf-8"));
    expect(pkgJson.devDependencies).toHaveProperty("@nanoforge-dev/network-client");
    expect(pkgJson.devDependencies).toHaveProperty("@nanoforge-dev/network-server");
    expect(existsSync(resolve(appDir, "node_modules", "@nanoforge-dev", "network-client"))).toBe(
      true,
    );
    expect(existsSync(resolve(appDir, "node_modules", "@nanoforge-dev", "network-server"))).toBe(
      true,
    );
  });

  it("should work with the add alias", async () => {
    const { exitCode } = await runCli(["add", "-l", "@nanoforge-dev/network-client", "-d", appDir]);

    expect(exitCode).toBe(0);

    const pkgJson = JSON.parse(readFileSync(resolve(appDir, "package.json"), "utf-8"));
    expect(pkgJson.devDependencies).toHaveProperty("@nanoforge-dev/network-client");
    expect(existsSync(resolve(appDir, "node_modules", "@nanoforge-dev", "network-client"))).toBe(
      true,
    );
  });
});

describe("nf install (with invalid directory)", () => {
  it("should fail when directory does not exist", async () => {
    const { exitCode } = await runCli([
      "install",
      "some-lib",
      "-d",
      resolve(tmpDir, "nonexistent"),
    ]);

    expect(exitCode).not.toBe(0);
  });
});

describe("nf install (without library name)", () => {
  const projectDir = resolve(tmpDir, "install-no-name");
  const appDir = resolve(projectDir, "install-no-name-app");

  beforeAll(async () => {
    mkdirSync(projectDir, { recursive: true });

    await runCli([
      "new",
      "--name",
      "install-no-name-app",
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
  });

  it("should prompt or fail when no library name is provided", async () => {
    const { stdout, stderr, killed } = await runCli(["install", "-d", appDir], {
      timeout: 3_000,
    });

    expect(killed || (stdout + stderr).length > 0).toBe(true);
  });
});
