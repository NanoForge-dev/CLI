import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { runCli } from "./helpers/run-cli";

const tmpDir = resolve(__dirname, "../.tmp-e2e-logout");
const RC_FILE = ".nanoforgerc";
const FETCH_MOCK_PATH = resolve(__dirname, "./helpers/fetch-mock.mjs");

function withMockedFetch(): NodeJS.ProcessEnv {
  const existing = process.env.NODE_OPTIONS ?? "";
  return {
    ...process.env,
    NODE_OPTIONS: `${existing} --import ${FETCH_MOCK_PATH}`.trim(),
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

describe("nf logout --help", () => {
  it("should display logout command help", async () => {
    const { stdout, exitCode } = await runCli(["logout", "--help"]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("logout from Nanoforge registry");
    expect(stdout).toContain("--directory");
    expect(stdout).toContain("--local");
  });
});

describe("nf logout (local mode)", () => {
  const dir = resolve(tmpDir, "logout-local");

  beforeEach(() => {
    mkdirSync(dir, { recursive: true });
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("should clear apiKey from local .nanoforgerc after logout", async () => {
    const fakeApiKey = "test-api-key-to-remove";

    await runCli(["login", "--local", "-d", dir, "-k", fakeApiKey], { env: withMockedFetch() });
    expect(readLocalRc(dir)).toContain(fakeApiKey);

    const { stdout, exitCode } = await runCli(["logout", "--local", "-d", dir]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("NanoForge Logout");
    expect(stdout).toContain("Logout completed!");

    expect(readLocalRc(dir)).not.toContain(fakeApiKey);
  });

  it("should succeed even when no prior login exists", async () => {
    const { exitCode } = await runCli(["logout", "--local", "-d", dir]);

    expect(exitCode).toBe(0);
  });
});

describe("nf login then logout (full flow, local mode)", () => {
  const dir = resolve(tmpDir, "full-flow");

  beforeEach(() => {
    mkdirSync(dir, { recursive: true });
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("should login and then logout successfully", async () => {
    const fakeApiKey = "full-flow-api-key-xyz";

    const loginResult = await runCli(["login", "--local", "-d", dir, "-k", fakeApiKey], {
      env: withMockedFetch(),
    });
    expect(loginResult.exitCode).toBe(0);
    expect(readLocalRc(dir)).toContain(fakeApiKey);

    const logoutResult = await runCli(["logout", "--local", "-d", dir]);
    expect(logoutResult.exitCode).toBe(0);
    expect(readLocalRc(dir)).not.toContain(fakeApiKey);
  });
});
