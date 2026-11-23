import { randomBytes } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type Input } from "@lib/input";

import { PublishAction } from "./publish.action";

const input = (entries: Record<string, unknown>): Input =>
  new Map(Object.entries(entries).map(([key, value]) => [key, { value }])) as Input;

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "nf-publish-action-"));
  writeFileSync(
    join(dir, "nanoforge.manifest.json"),
    JSON.stringify({
      name: "@acme/kit",
      version: "1.2.0",
      type: "package",
      contents: [{ kind: "asset", path: "assets/" }],
    }),
  );
  writeFileSync(join(dir, ".nanoforgerc"), "apiKey=secret-key\n");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  rmSync(dir, { recursive: true, force: true });
});

describe("PublishAction", () => {
  it("refuses an archive past the registry's 20 MiB before uploading it", async () => {
    mkdirSync(join(dir, "assets"));
    // Random bytes do not compress: the archive is over 20 MiB too.
    writeFileSync(join(dir, "assets/noise.bin"), randomBytes(21 * 1024 * 1024));
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    vi.spyOn(console, "info").mockImplementation(() => undefined);

    await expect(new PublishAction().handle(new Map(), input({ directory: dir }))).rejects.toThrow(
      /too large: over 20 MiB packed, the most the registry takes\. Name fewer files/,
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});
