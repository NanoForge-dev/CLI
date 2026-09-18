import { existsSync, statSync } from "node:fs";
import { glob } from "node:fs/promises";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConfigNotFoundError } from "@utils/errors";

import { loadConfig } from "./config-loader";
import { parseWorkspaceConfig } from "./workspace-config-parser";

vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
  statSync: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  glob: vi.fn(),
}));

vi.mock("./config-loader", () => ({
  loadConfig: vi.fn(),
}));

const asDirectory = () => ({ isDirectory: () => true });

const asyncIterableOf = <T>(values: T[]): AsyncIterable<T> => ({
  [Symbol.asyncIterator]: async function* () {
    for (const value of values) yield value;
  },
});

describe("parseWorkspaceConfig", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(statSync).mockReturnValue(asDirectory() as ReturnType<typeof statSync>);
  });

  it("resolves a root project config", async () => {
    const config = { type: "client" as const };
    vi.mocked(loadConfig).mockResolvedValue(config);

    const result = await parseWorkspaceConfig("/app");

    expect(result).toEqual({ type: "project", config });
  });

  it("throws when the root config is a lib", async () => {
    vi.mocked(loadConfig).mockResolvedValue({ type: "lib" as const });

    await expect(parseWorkspaceConfig("/app")).rejects.toThrow(
      "the root config cannot be of type 'lib'",
    );
  });

  it("resolves every directory a package pattern matches", async () => {
    const workspaceConfig = { type: "workspace" as const, packages: ["apps/*"] };
    const clientConfig = { type: "client" as const };
    const libConfig = { type: "lib" as const };

    vi.mocked(glob).mockReturnValue(
      asyncIterableOf(["apps/client", "apps/foo-lib"]) as ReturnType<typeof glob>,
    );
    vi.mocked(loadConfig).mockImplementation(async (directory: string) => {
      if (directory === "/app") return workspaceConfig;
      if (directory === join("/app", "apps/client")) return clientConfig;
      if (directory === join("/app", "apps/foo-lib")) return libConfig;
      throw new Error(`unexpected directory: ${directory}`);
    });

    const result = await parseWorkspaceConfig("/app");

    expect(result).toEqual({
      type: "workspace",
      config: workspaceConfig,
      projects: {
        "apps/client": { type: "project", config: clientConfig },
        "apps/foo-lib": { type: "lib", config: libConfig },
      },
    });
  });

  it("skips a matched directory with no config instead of throwing", async () => {
    const workspaceConfig = { type: "workspace" as const, packages: ["apps/*"] };
    const clientConfig = { type: "client" as const };

    vi.mocked(glob).mockReturnValue(
      asyncIterableOf(["apps/client", "apps/empty"]) as ReturnType<typeof glob>,
    );
    vi.mocked(loadConfig).mockImplementation(async (directory: string) => {
      if (directory === "/app") return workspaceConfig;
      if (directory === join("/app", "apps/client")) return clientConfig;
      throw new ConfigNotFoundError(join(directory, "nanoforge.config.ts"));
    });

    const result = await parseWorkspaceConfig("/app");

    expect(result).toEqual({
      type: "workspace",
      config: workspaceConfig,
      projects: {
        "apps/client": { type: "project", config: clientConfig },
      },
    });
  });

  it("warns instead of throwing when a pattern matches no project or lib", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const workspaceConfig = { type: "workspace" as const, packages: ["apps/*"] };

    vi.mocked(glob).mockReturnValue(asyncIterableOf([]) as ReturnType<typeof glob>);
    vi.mocked(loadConfig).mockResolvedValue(workspaceConfig);

    const result = await parseWorkspaceConfig("/app");

    expect(result).toEqual({ type: "workspace", config: workspaceConfig, projects: {} });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("apps/*"));
  });

  it("throws when a matched package is itself a workspace", async () => {
    const workspaceConfig = { type: "workspace" as const, packages: ["apps/*"] };

    vi.mocked(glob).mockReturnValue(asyncIterableOf(["apps/nested"]) as ReturnType<typeof glob>);
    vi.mocked(loadConfig).mockImplementation(async (directory: string) => {
      if (directory === "/app") return workspaceConfig;
      return { type: "workspace" as const };
    });

    await expect(parseWorkspaceConfig("/app")).rejects.toThrow(
      "a workspace package cannot itself be of type 'workspace'",
    );
  });
});
