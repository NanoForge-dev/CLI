import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createRegistry, publishIgnore } from "./registry";

describe("publishIgnore", () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "nf-publish-ignore-"));
    mkdirSync(join(root, "assets"));
    mkdirSync(join(root, "sub"));
    writeFileSync(
      join(root, "sub/nanoforge.manifest.json"),
      JSON.stringify({ contents: [{ kind: "file", path: "a.ts" }] }),
    );
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  const packageIgnore = () =>
    publishIgnore(root, {
      name: "@acme/kit",
      type: "package",
      contents: [
        { kind: "file", path: "src/" },
        { kind: "asset", path: "assets" },
        { kind: "file", path: "lib/one.ts" },
      ],
      include: ["sub"],
    });

  it.each([
    ["notes.txt", false],
    [".git-credentials", false],
    [".pgpass", false],
    ["credentials.json", false],
    [".aws", true],
    [".docker", true],
    ["other", true],
    ["lib/two.ts", false],
    ["sub/b.ts", false],
    ["src/.env", false],
    ["src/.env.production", false],
    ["src/.npmrc", false],
    ["src/.netrc", false],
    ["src/.nanoforgerc", false],
    ["src/key.pem", false],
    ["src/server.key", false],
    ["src/cert.p12", false],
    ["src/cert.pfx", false],
    ["src/app.keystore", false],
    ["src/id_rsa", false],
    ["src/id_ecdsa", false],
    ["src/id_ed25519_sk", false],
    ["src/id_rsa.bak", false],
    ["src/ID_RSA", false],
    ["src/id_rsa-old", false],
    ["src/putty.ppk", false],
    ["src/id_github", false],
    ["src/id_deploy_key", false],
    ["src/.ENV", false],
    ["src/Credentials.json", false],
    ["src/.AWS", true],
    ["src/KEY.PEM", false],
    ["src/.git", true],
    ["src/node_modules", true],
    ["src/nf_modules", true],
    ["src/.nanoforge", true],
    ["src/.aws", true],
  ])("leaves out %s", async (path, isDirectory) => {
    expect((await packageIgnore())(path, isDirectory)).toBe(true);
  });

  it.each([
    ["nanoforge.manifest.json", false],
    ["README.md", false],
    ["LICENSE", false],
    ["CHANGELOG.md", false],
    ["src", true],
    ["src/player/velocity.ts", false],
    ["src/id_rsa.pub", false],
    ["src/id_map.ts", false],
    ["assets/sprite.png", false],
    ["lib", true],
    ["lib/one.ts", false],
    ["sub", true],
    ["sub/nanoforge.manifest.json", false],
    ["sub/a.ts", false],
  ])("packs %s", async (path, isDirectory) => {
    expect((await packageIgnore())(path, isDirectory)).toBe(false);
  });

  it("packs the folder of a plugin's entry files and its contributed paths", async () => {
    const atRoot = await publishIgnore(root, {
      type: "plugin",
      entry: { client: "index.js" },
    });
    expect(atRoot("index.js", false)).toBe(false);
    expect(atRoot("index.css", false)).toBe(false);
    expect(atRoot("chunks", true)).toBe(false);
    expect(atRoot("chunks/editor.js", false)).toBe(false);
    expect(atRoot("assets/logo.png", false)).toBe(false);
    expect(atRoot(".env", false)).toBe(true);
    expect(atRoot("secrets.txt", false)).toBe(true);
    expect(atRoot("service-account.json", false)).toBe(true);
    expect(atRoot("kubeconfig", false)).toBe(true);
    expect(atRoot("terraform.tfstate", false)).toBe(true);
    expect(atRoot("config/prod.yaml", false)).toBe(true);

    const inDist = await publishIgnore(root, {
      type: "plugin",
      entry: { client: "./dist/index.js" },
      contributes: { icons: [{ id: "leaf", path: "icons/leaf.svg" }] },
    });
    expect(inDist("dist", true)).toBe(false);
    expect(inDist("dist/style.css", false)).toBe(false);
    expect(inDist("dist/notes.txt", false)).toBe(true);
    expect(inDist("icons", true)).toBe(false);
    expect(inDist("icons/leaf.svg", false)).toBe(false);
    expect(inDist("icons/other.svg", false)).toBe(true);
    expect(inDist("src", true)).toBe(true);
  });

  it("packs the icon files of a plugin's icon themes", async () => {
    const ignore = await publishIgnore(root, {
      type: "plugin",
      contributes: {
        iconThemes: [{ id: "ocean", label: "Ocean", icons: { folder: "icons/folder.svg" } }],
      },
    });
    expect(ignore("icons", true)).toBe(false);
    expect(ignore("icons/folder.svg", false)).toBe(false);
    expect(ignore("icons/other.svg", false)).toBe(true);
  });

  it("packs nothing a package's entry names: entry is for plugins", async () => {
    const ignore = await publishIgnore(root, { type: "package", entry: { client: "index.js" } });
    expect(ignore("index.js", false)).toBe(true);
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
