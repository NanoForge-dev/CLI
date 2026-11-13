import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runCli } from "./helpers/run-cli";

const tmpDir = resolve(__dirname, "../.tmp-e2e-install");
// --import needs a file URL: a raw D:\ path is rejected on Windows.
const FETCH_MOCK_PATH = pathToFileURL(resolve(__dirname, "./helpers/fetch-mock.mjs")).href;

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
    const { exitCode, stdout, stderr } = await runCli([
      "install",
      "-l",
      "@nanoforge-dev/network-client",
      "-d",
      appDir,
    ]);

    expect(exitCode, `${stdout}\n${stderr}`).toBe(0);

    const pkgJson = JSON.parse(readFileSync(resolve(appDir, "package.json"), "utf-8"));
    expect(pkgJson.devDependencies).toHaveProperty("@nanoforge-dev/network-client");
    expect(existsSync(resolve(appDir, "node_modules", "@nanoforge-dev", "network-client"))).toBe(
      true,
    );
  });

  it("should run the install command with multiple library names", async () => {
    const { exitCode, stdout, stderr } = await runCli([
      "install",
      "-l",
      "@nanoforge-dev/network-client",
      "@nanoforge-dev/network-server",
      "-d",
      appDir,
    ]);

    expect(exitCode, `${stdout}\n${stderr}`).toBe(0);

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
    const { exitCode, stdout, stderr } = await runCli([
      "add",
      "-l",
      "@nanoforge-dev/network-client",
      "-d",
      appDir,
    ]);

    expect(exitCode, `${stdout}\n${stderr}`).toBe(0);

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

describe("nf install (registry packages)", () => {
  const registryDir = resolve(tmpDir, "registry");
  const appDir = resolve(tmpDir, "registry-app");
  const env = {
    ...process.env,
    NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ""} --import ${FETCH_MOCK_PATH}`.trim(),
    MOCK_REGISTRY_DIR: registryDir,
  };
  const publishVersion = (name: string, version: string, dependencies = {}) => {
    const folder = resolve(registryDir, name, version);
    mkdirSync(folder, { recursive: true });
    writeFileSync(
      resolve(folder, "nanoforge.manifest.json"),
      JSON.stringify({ name, version, type: "package", dependencies }),
    );
    writeFileSync(resolve(folder, "index.ts"), `export const version = "${version}";`);
  };

  beforeAll(() => {
    publishVersion("@test-org/shapes", "1.0.0");
    publishVersion("@test-org/shapes", "2.0.0");
    publishVersion("@test-org/kit", "1.0.0", { "@test-org/shapes": "^1.0.0" });
    mkdirSync(appDir, { recursive: true });
  });

  it("installs a package and its dependencies into nf_modules", async () => {
    const { exitCode } = await runCli(["install", "@test-org/kit", "-d", appDir], { env });

    expect(exitCode).toBe(0);
    expect(
      readFileSync(resolve(appDir, "nf_modules/@test-org/shapes/index.ts"), "utf-8"),
    ).toContain("1.0.0");
    expect(existsSync(resolve(appDir, "nf_modules/@test-org/kit/nanoforge.manifest.json"))).toBe(
      true,
    );
    const list = JSON.parse(readFileSync(resolve(appDir, "nanoforge.packages.json"), "utf-8"));
    expect(list.packages).toEqual({ "@test-org/kit": "^1.0.0" });
    const tsconfig = JSON.parse(readFileSync(resolve(appDir, "tsconfig.json"), "utf-8"));
    expect(tsconfig.compilerOptions.paths["@test-org/kit/*"]).toEqual([
      "./nf_modules/@test-org/kit/*",
    ]);
  });

  it("refuses a range no version fits, and leaves the project as it was", async () => {
    const { exitCode } = await runCli(["install", "@test-org/kit@^3.0.0", "-d", appDir], { env });

    expect(exitCode).not.toBe(0);
    const list = JSON.parse(readFileSync(resolve(appDir, "nanoforge.packages.json"), "utf-8"));
    expect(list.packages).toEqual({ "@test-org/kit": "^1.0.0" });
  });

  it("restores the locked packages when given no name", async () => {
    rmSync(resolve(appDir, "nf_modules"), { recursive: true, force: true });

    const { exitCode } = await runCli(["install", "-d", appDir], { env });

    expect(exitCode).toBe(0);
    expect(existsSync(resolve(appDir, "nf_modules/@test-org/kit/index.ts"))).toBe(true);
    expect(existsSync(resolve(appDir, "nf_modules/@test-org/shapes/index.ts"))).toBe(true);
  });
});

describe("nf install (without package name)", () => {
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

  it("succeeds with nothing locked, without asking", async () => {
    const { exitCode, killed } = await runCli(["install", "-d", appDir], { timeout: 10_000 });

    expect(killed).toBe(false);
    expect(exitCode).toBe(0);
    expect(existsSync(resolve(appDir, "nf_modules"))).toBe(false);
  });
});
