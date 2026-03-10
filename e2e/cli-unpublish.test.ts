import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { runCli } from "./helpers/run-cli";

const tmpDir = resolve(__dirname, "../.tmp-e2e-unpublish");
const FETCH_MOCK_PATH = resolve(__dirname, "./helpers/fetch-mock.mjs");

function withMockedFetch(status = 200): NodeJS.ProcessEnv {
  const existing = process.env.NODE_OPTIONS ?? "";
  return {
    ...process.env,
    NODE_OPTIONS: `${existing} --import ${FETCH_MOCK_PATH}`.trim(),
    MOCK_REGISTRY_STATUS: String(status),
  };
}

function writeManifest(dir: string) {
  const manifest = {
    name: "test-org/test-package",
    type: "component",
  };
  writeFileSync(resolve(dir, "nanoforge.manifest.json"), JSON.stringify(manifest));
}

beforeAll(() => {
  mkdirSync(tmpDir, { recursive: true });
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("nf unpublish --help", () => {
  it("should display unpublish command help", async () => {
    const { stdout, exitCode } = await runCli(["unpublish", "--help"]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("unpublish package to Nanoforge registry");
    expect(stdout).toContain("--directory");
  });
});

describe("nf unpublish", () => {
  const dir = resolve(tmpDir, "unpublish-main");

  beforeEach(async () => {
    mkdirSync(dir, { recursive: true });
    await runCli(["login", "--local", "-d", dir, "-k", "test-api-key"], {
      env: withMockedFetch(),
    });
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("should unpublish successfully with a valid manifest", async () => {
    writeManifest(dir);

    const { stdout, exitCode } = await runCli(["unpublish", "-d", dir], {
      env: withMockedFetch(),
    });

    expect(exitCode).toBe(0);
    expect(stdout).toContain("NanoForge Unpublish");
    expect(stdout).toContain("Unpublish completed!");
  });

  it("should fail when the manifest file is missing", async () => {
    const { exitCode } = await runCli(["unpublish", "-d", dir], {
      env: withMockedFetch(),
    });

    expect(exitCode).not.toBe(0);
  });

  it("should fail when the registry rejects the request", async () => {
    writeManifest(dir);

    const { exitCode } = await runCli(["unpublish", "-d", dir], {
      env: withMockedFetch(401),
    });

    expect(exitCode).not.toBe(0);
  });
});
