import { describe, expect, it } from "vitest";

import {
  resolveClientConfig,
  resolveConfig,
  resolveLibConfig,
  resolveServerConfig,
  resolveWorkspaceConfig,
} from "../src";

describe("resolveWorkspaceConfig", () => {
  it("fills in defaults for an empty config", () => {
    expect(resolveWorkspaceConfig({ type: "workspace" })).toEqual({
      type: "workspace",
      packages: [],
    });
  });

  it("lets an explicit override win", () => {
    expect(resolveWorkspaceConfig({ type: "workspace", packages: ["apps/*"] })).toEqual({
      type: "workspace",
      packages: ["apps/*"],
    });
  });
});

describe("resolveLibConfig", () => {
  it("fills in nested dir defaults", () => {
    expect(resolveLibConfig({ type: "lib" }).dir).toEqual({
      assets: "assets",
      shared: "shared",
      components: "shared/components",
      systems: "shared/systems",
      scenes: "shared/scenes",
    });
  });

  it("merges a partial dir override with defaults", () => {
    expect(resolveLibConfig({ type: "lib", dir: { assets: "static" } }).dir).toEqual({
      assets: "static",
      shared: "shared",
      components: "shared/components",
      systems: "shared/systems",
      scenes: "shared/scenes",
    });
  });
});

describe("resolveClientConfig", () => {
  it("fills in defaults for an empty config", () => {
    const resolved = resolveClientConfig({ type: "client" });
    expect(resolved.entryFile).toBe("src/main.ts");
    expect(resolved.out).toEqual({ dir: "dist", mainFile: "main.js" });
    expect(resolved.libs).toEqual([]);
  });

  it("replaces array fields wholesale instead of concatenating", () => {
    const resolved = resolveClientConfig({ type: "client", libs: ["../../libs/test-lib"] });
    expect(resolved.libs).toEqual(["../../libs/test-lib"]);
  });
});

describe("resolveServerConfig", () => {
  it("fills in defaults for an empty config", () => {
    const resolved = resolveServerConfig({ type: "server" });
    expect(resolved.entryFile).toBe("src/main.ts");
    expect(resolved.dir?.assets).toBe("assets");
  });
});

describe("resolveConfig", () => {
  it("dispatches to the resolver matching the config's type", () => {
    expect(resolveConfig({ type: "workspace" })).toEqual({ type: "workspace", packages: [] });
    expect(resolveConfig({ type: "server" }).entryFile).toBe("src/main.ts");
  });
});
