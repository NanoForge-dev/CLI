import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { runCli } from "./helpers/run-cli";

const tmpDir = resolve(__dirname, "../.tmp-e2e-publish");
const FETCH_MOCK_PATH = resolve(__dirname, "./helpers/fetch-mock.mjs");

const LOG_PATH = resolve(tmpDir, "requests.jsonl");

function withMockedFetch(status = 200): NodeJS.ProcessEnv {
  const existing = process.env.NODE_OPTIONS ?? "";
  return {
    ...process.env,
    NODE_OPTIONS: `${existing} --import ${FETCH_MOCK_PATH}`.trim(),
    MOCK_REGISTRY_STATUS: String(status),
    MOCK_REGISTRY_LOG: LOG_PATH,
  };
}

function writeManifest(dir: string, overrides: Record<string, unknown> = {}) {
  const manifest = {
    name: "@test-org/test-package",
    version: "1.0.0",
    type: "package",
    ...overrides,
  };
  writeFileSync(resolve(dir, "nanoforge.manifest.json"), JSON.stringify(manifest));
}

function writePackageFile(dir: string, filename = "index.ts") {
  writeFileSync(resolve(dir, filename), `export default {};`);
}

const requests = (): { method: string; url: string; authorization: string; files?: string[] }[] =>
  readFileSync(LOG_PATH, "utf-8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));

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
    expect(stdout).toContain("--dry-run");
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
    rmSync(LOG_PATH, { force: true });
  });

  it("should publish the folder as a zip, without secrets nor installed folders", async () => {
    writeManifest(dir);
    writePackageFile(dir);
    mkdirSync(resolve(dir, "src/node_modules/x"), { recursive: true });
    writePackageFile(dir, "src/node_modules/x/index.js");
    writePackageFile(dir, "src/player.ts");
    writeFileSync(resolve(dir, ".env"), "SECRET=1");
    writeFileSync(resolve(dir, "src/.env.local"), "SECRET=2");
    rmSync(LOG_PATH, { force: true });

    const { stdout, exitCode } = await runCli(["publish", "-d", dir], {
      env: withMockedFetch(),
    });

    expect(exitCode).toBe(0);
    expect(stdout).toContain("NanoForge Publish");
    expect(stdout).toContain("Publish completed!");
    expect(stdout).not.toContain("test-api-key");
    const [put] = requests();
    expect(put).toMatchObject({
      method: "PUT",
      url: "https://api.nanoforge.eu/registry/@test-org/test-package",
      authorization: "Bearer test-api-key",
    });
    // `.nanoforgerc` (written by `nf login --local` above) holds the key: never packed.
    expect(put!.files!.sort()).toEqual(["index.ts", "nanoforge.manifest.json", "src/player.ts"]);
  });

  it("should list the files and publish nothing with --dry-run", async () => {
    writeManifest(dir);
    writePackageFile(dir);
    writeFileSync(resolve(dir, ".npmrc"), "//registry.npmjs.org/:_authToken=x");
    rmSync(LOG_PATH, { force: true });

    const { stdout, exitCode } = await runCli(["publish", "--dry-run", "-d", dir], {
      env: withMockedFetch(),
    });

    expect(exitCode).toBe(0);
    expect(stdout).toContain("index.ts");
    expect(stdout).toContain("@test-org/test-package@1.0.0: 2 files");
    expect(stdout).not.toContain(".npmrc");
    expect(stdout).toContain("nothing was published");
    expect(() => readFileSync(LOG_PATH)).toThrow();
  });

  it("should fail when the manifest is in the old format", async () => {
    writeManifest(dir, { name: "test-org/test-package", type: "component" });

    const { exitCode } = await runCli(["publish", "-d", dir], {
      env: withMockedFetch(),
    });

    expect(exitCode).not.toBe(0);
  });

  it("should fail when the manifest file is missing", async () => {
    writePackageFile(dir);

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
});
