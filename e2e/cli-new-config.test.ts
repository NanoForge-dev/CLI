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
      "-d",
      projectDir,
    ]);

    config = JSON.parse(
      readFileSync(resolve(projectDir, "config-test/nanoforge.config.json"), "utf-8"),
    );
  });

  it("should have client build config", () => {
    expect(config.client.build.entryFile).toBe("client/main.ts");
    expect(config.client.build.outDir).toBe(".nanoforge/client");
  });

  it("should have client runtime config", () => {
    expect(config.client.runtime.dir).toBe(".nanoforge/client");
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

  it("should have server build config", () => {
    expect(config.server.build.entryFile).toBe("server/main.ts");
    expect(config.server.build.outDir).toBe(".nanoforge/server");
  });

  it("should have server runtime config", () => {
    expect(config.server.runtime.dir).toBe(".nanoforge/server");
  });

  it("should have client build config", () => {
    expect(config.client.build.entryFile).toBe("client/main.ts");
    expect(config.client.build.outDir).toBe(".nanoforge/client");
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
  });
});
