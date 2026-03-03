import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { runCli } from "./helpers/run-cli";

const tmpDir = resolve(__dirname, "../.tmp-e2e-login");
const RC_FILE = ".nanoforgerc";
const FETCH_MOCK_PATH = resolve(__dirname, "./helpers/fetch-mock.mjs");

function withMockedFetch(status = 200): NodeJS.ProcessEnv {
  const existing = process.env.NODE_OPTIONS ?? "";
  return {
    ...process.env,
    NODE_OPTIONS: `${existing} --import ${FETCH_MOCK_PATH}`.trim(),
    MOCK_REGISTRY_STATUS: String(status),
  };
}

function readLocalRc(dir: string): string {
  const rcPath = resolve(dir, RC_FILE);
  if (!existsSync(rcPath)) return "";
  return readFileSync(rcPath, "utf-8");
}

beforeAll(() => {
  mkdirSync(tmpDir, { recursive: true });
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("nf login --help", () => {
  it("should display login command help", async () => {
    const { stdout, exitCode } = await runCli(["login", "--help"]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("login to Nanoforge registry");
    expect(stdout).toContain("--directory");
    expect(stdout).toContain("--local");
    expect(stdout).toContain("--api-key");
  });
});

describe("nf login (local mode)", () => {
  const dir = resolve(tmpDir, "login-local");

  beforeEach(() => {
    mkdirSync(dir, { recursive: true });
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("should write apiKey to local .nanoforgerc", async () => {
    const fakeApiKey = "test-api-key-abc123";
    const { stdout, exitCode } = await runCli(["login", "--local", "-d", dir, "-k", fakeApiKey], {
      env: withMockedFetch(),
    });

    expect(exitCode).toBe(0);
    expect(stdout).toContain("NanoForge Login");
    expect(stdout).toContain("Login completed!");

    const rcContent = readLocalRc(dir);
    expect(rcContent).toContain(fakeApiKey);
  });

  it("should create the .nanoforgerc file in the specified directory", async () => {
    await runCli(["login", "--local", "-d", dir, "-k", "test-api-key-create-file"], {
      env: withMockedFetch(),
    });

    expect(existsSync(resolve(dir, RC_FILE))).toBe(true);
  });

  it("should overwrite apiKey on second login", async () => {
    const firstKey = "first-api-key";
    const secondKey = "second-api-key";

    await runCli(["login", "--local", "-d", dir, "-k", firstKey], { env: withMockedFetch() });
    expect(readLocalRc(dir)).toContain(firstKey);

    await runCli(["login", "--local", "-d", dir, "-k", secondKey], { env: withMockedFetch() });
    const rcContent = readLocalRc(dir);
    expect(rcContent).toContain(secondKey);
    expect(rcContent).not.toContain(firstKey);
  });

  it("should fail when the registry rejects the api key", async () => {
    const { exitCode } = await runCli(["login", "--local", "-d", dir, "-k", "invalid-key"], {
      env: withMockedFetch(401),
    });

    expect(exitCode).not.toBe(0);
    expect(existsSync(resolve(dir, RC_FILE))).toBe(false);
  });
});
