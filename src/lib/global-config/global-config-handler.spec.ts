import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { GLOBAL_CONFIG_FILE_NAME } from "@lib/constants";

import { GlobalConfigHandler } from "./global-config-handler";

describe.skipIf(process.platform === "win32")("GlobalConfigHandler.write", () => {
  const dir = mkdtempSync(join(tmpdir(), "nf-global-config-"));
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("should make the local config, which holds the api key, readable by its owner only", () => {
    GlobalConfigHandler.write({ apiKey: "secret" }, true, dir);
    expect(statSync(join(dir, GLOBAL_CONFIG_FILE_NAME)).mode & 0o777).toBe(0o600);
    expect(GlobalConfigHandler.read(dir).apiKey).toBe("secret");
  });
});
