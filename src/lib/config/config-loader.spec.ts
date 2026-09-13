import { parseConfig } from "@nanoforge-dev/config";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getConfig } from "./config-loader";

vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
}));

vi.mock("@nanoforge-dev/config", () => ({
  parseConfig: vi.fn(),
}));

describe("getConfig", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("loads nanoforge.config.ts when it exists", async () => {
    vi.mocked(existsSync).mockImplementation((path) => String(path).endsWith(".ts"));
    const resolved = { type: "client" as const };
    vi.mocked(parseConfig).mockResolvedValue(resolved);

    const result = await getConfig("/project");

    expect(parseConfig).toHaveBeenCalledWith(join("/project", "nanoforge.config.ts"));
    expect(result).toBe(resolved);
  });

  it("falls back to nanoforge.config.js when no .ts file exists", async () => {
    vi.mocked(existsSync).mockImplementation((path) => String(path).endsWith(".js"));
    const resolved = { type: "server" as const };
    vi.mocked(parseConfig).mockResolvedValue(resolved);

    const result = await getConfig("/project");

    expect(parseConfig).toHaveBeenCalledWith(join("/project", "nanoforge.config.js"));
    expect(result).toBe(resolved);
  });

  it("throws when neither nanoforge.config.ts nor .js exists", async () => {
    vi.mocked(existsSync).mockReturnValue(false);

    await expect(getConfig("/project")).rejects.toThrow("Configuration file not found at path:");
    expect(parseConfig).not.toHaveBeenCalled();
  });
});
