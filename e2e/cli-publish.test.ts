import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { runCli } from "./helpers/run-cli";

const tmpDir = resolve(__dirname, "../.tmp-e2e-publish");
const FETCH_MOCK_PATH = resolve(__dirname, "./helpers/fetch-mock.mjs");

function withMockedFetch(status = 200): NodeJS.ProcessEnv {
  const existing = process.env.NODE_OPTIONS ?? "";
  return {
    ...process.env,
    NODE_OPTIONS: `${existing} --import ${FETCH_MOCK_PATH}`.trim(),
    MOCK_REGISTRY_STATUS: String(status),
  };
}

function writeManifest(dir: string, overrides: Record<string, unknown> = {}) {
  const manifest = {
    name: "test-org/test-package",
    type: "component",
    ...overrides,
  };
  writeFileSync(resolve(dir, "nanoforge.manifest.json"), JSON.stringify(manifest));
}

function writePackageFile(dir: string, filename = "index.ts") {
  writeFileSync(resolve(dir, filename), `export default {};`);
}

beforeAll(() => {
  mkdirSync(tmpDir, { recursive: true });
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("nf publish --help", () => {
  it("should display publish command help", async () => {
    const { stdout, exitCode } = await runCli(["publish", "--help"]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("publish package to Nanoforge registry");
    expect(stdout).toContain("--directory");
  });
});

describe("nf publish", () => {
  const dir = resolve(tmpDir, "publish-main");

  beforeEach(async () => {
    mkdirSync(dir, { recursive: true });
    await runCli(["login", "--local", "-d", dir, "-k", "test-api-key"], {
      env: withMockedFetch(),
    });
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("should publish successfully with a valid manifest and package file", async () => {
    writeManifest(dir);
    writePackageFile(dir);

    const { stdout, exitCode } = await runCli(["publish", "-d", dir], {
      env: withMockedFetch(),
    });

    expect(exitCode).toBe(0);
    expect(stdout).toContain("NanoForge Publish");
    expect(stdout).toContain("Publish completed!");
  });

  it("should fail when the manifest file is missing", async () => {
    writePackageFile(dir);

    const { exitCode } = await runCli(["publish", "-d", dir], {
      env: withMockedFetch(),
    });

    expect(exitCode).not.toBe(0);
  });

  it("should fail when the package file is missing", async () => {
    writeManifest(dir);

    const { exitCode } = await runCli(["publish", "-d", dir], {
      env: withMockedFetch(),
    });

    expect(exitCode).not.toBe(0);
  });

  it("should fail when the registry rejects the request", async () => {
    writeManifest(dir);
    writePackageFile(dir);

    const { exitCode } = await runCli(["publish", "-d", dir], {
      env: withMockedFetch(401),
    });

    expect(exitCode).not.toBe(0);
  });

  it("should use a custom package file path from the manifest", async () => {
    writeManifest(dir, { publish: { paths: { package: "src/main.ts" } } });
    mkdirSync(resolve(dir, "src"), { recursive: true });
    writePackageFile(dir, "src/main.ts");

    const { stdout, exitCode } = await runCli(["publish", "-d", dir], {
      env: withMockedFetch(),
    });

    expect(exitCode).toBe(0);
    expect(stdout).toContain("Publish completed!");
  });
});
