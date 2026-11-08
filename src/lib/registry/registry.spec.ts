import { describe, expect, it, vi } from "vitest";

import { createRegistry, isIgnoredWhenPublishing } from "./registry";

describe("isIgnoredWhenPublishing", () => {
  it.each([
    [".env", false],
    [".env.local", false],
    ["src/.env.production", false],
    [".nanoforgerc", false],
    [".git", true],
    ["node_modules", true],
    ["src/node_modules", true],
    ["nf_modules", true],
  ])("leaves out %s", (path, isDirectory) => {
    expect(isIgnoredWhenPublishing(path, isDirectory)).toBe(true);
  });

  it.each([
    ["index.ts", false],
    ["environment.ts", false],
    [".envrc.example", false],
    ["src", true],
    ["assets/.git-keep", false],
  ])("keeps %s", (path, isDirectory) => {
    expect(isIgnoredWhenPublishing(path, isDirectory)).toBe(false);
  });
});

describe("createRegistry", () => {
  it("sends the key as a bearer token, and none without one", async () => {
    const fetch = vi.fn(async () => Response.json({ username: "me", scopes: [] }));
    vi.stubGlobal("fetch", fetch);
    try {
      await createRegistry("key").whoami();
      await createRegistry().whoami();
      const headers = fetch.mock.calls.map((call) =>
        new Headers((call as unknown as [string, RequestInit])[1].headers).get("authorization"),
      );
      expect(headers).toEqual(["Bearer key", null]);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
