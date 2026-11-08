import { describe, expect, it, vi } from "vitest";

import { createRegistry, publishIgnore } from "./registry";

describe("publishIgnore", () => {
  const ignore = publishIgnore({ name: "@acme/kit" });

  it.each([
    [".env", false],
    [".env.local", false],
    [".envrc", false],
    ["src/.env.production", false],
    [".npmrc", false],
    [".netrc", false],
    [".nanoforgerc", false],
    ["key.pem", false],
    ["certs/server.key", false],
    ["id_rsa", false],
    ["id_ed25519.pub", false],
    [".git", true],
    ["node_modules", true],
    ["src/node_modules", true],
    ["nf_modules", true],
    [".nanoforge", true],
    ["dist", true],
  ])("leaves out %s", (path, isDirectory) => {
    expect(ignore(path, isDirectory)).toBe(true);
  });

  it.each([
    ["index.ts", false],
    ["environment.ts", false],
    ["keys.ts", false],
    ["src", true],
    ["src/dist", true],
    ["assets/.git-keep", false],
  ])("keeps %s", (path, isDirectory) => {
    expect(ignore(path, isDirectory)).toBe(false);
  });

  it.each([
    [{ contents: [{ kind: "file", path: "dist/kit.js" }] }],
    [{ entry: { client: "./dist/index.js" } }],
    [{ include: ["dist/assets"] }],
    [{ readme: "dist/README.md" }],
  ])("keeps dist when the manifest points into it: %j", (fields) => {
    expect(publishIgnore({ name: "@acme/kit", ...fields })("dist", true)).toBe(false);
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
