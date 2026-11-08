import { DirectoryRegistry, readArchive, serveRegistry } from "@nanoforge-dev/registry";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type Input } from "@lib/input";

import { InstallAction, parsePackageSpec } from "./install.action";
import { LoginAction } from "./login.action";
import { PublishAction } from "./publish.action";
import { UnpublishAction } from "./unpublish.action";

const input = (entries: Record<string, unknown>): Input =>
  new Map(Object.entries(entries).map(([key, value]) => [key, { value }])) as Input;

interface Seen {
  url: string;
  method: string;
  authorization: string | null;
  body: unknown;
}

let dir: string;
let seen: Seen[];

/** Stubs `fetch`: records each request, answers with `answer`. */
const stubFetch = (answer: (url: string, init: RequestInit) => Promise<Response> | Response) =>
  vi.stubGlobal("fetch", async (url: string, init: RequestInit = {}) => {
    seen.push({
      url,
      method: init.method ?? "GET",
      authorization: new Headers(init.headers).get("authorization"),
      body: init.body,
    });
    return answer(url, init);
  });

const writeJson = (path: string, value: unknown) => {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, JSON.stringify(value));
};

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "nf-registry-action-"));
  seen = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
  rmSync(dir, { recursive: true, force: true });
});

describe("parsePackageSpec", () => {
  it.each([
    ["@acme/kit", ["@acme/kit", undefined]],
    ["@acme/kit@^1.2.0", ["@acme/kit", "^1.2.0"]],
    ["@acme/kit@", ["@acme/kit", undefined]],
    ["kit", ["kit", undefined]],
  ])("reads %s", (spec, expected) => {
    expect(parsePackageSpec(spec)).toEqual(expected);
  });
});

describe("InstallAction", () => {
  const registryDir = () => join(dir, "registry");
  const project = () => join(dir, "project");

  beforeEach(() => {
    for (const version of ["1.0.0", "1.5.0", "2.0.0"]) {
      const folder = join(registryDir(), "@acme/shapes", version);
      writeJson(join(folder, "nanoforge.manifest.json"), {
        name: "@acme/shapes",
        version,
        type: "package",
      });
    }
    mkdirSync(project());
    stubFetch((url) => serveRegistry(new DirectoryRegistry(registryDir()))(url));
  });

  it("installs the newest version a range allows into nf_modules", async () => {
    const result = await new InstallAction().handle(
      input({ names: ["@acme/shapes@^1.0.0"] }),
      input({ directory: project() }),
    );

    expect(result.success).toBe(true);
    const manifest = JSON.parse(
      readFileSync(join(project(), "nf_modules/@acme/shapes/nanoforge.manifest.json"), "utf-8"),
    );
    expect(manifest.version).toBe("1.5.0");
    expect(seen.every(({ authorization }) => authorization === null)).toBe(true);
  });

  it("restores the locked packages without names", async () => {
    await new InstallAction().handle(
      input({ names: ["@acme/shapes"] }),
      input({ directory: project() }),
    );
    rmSync(join(project(), "nf_modules"), { recursive: true });

    const result = await new InstallAction().handle(input({}), input({ directory: project() }));

    expect(result.success).toBe(true);
    expect(existsSync(join(project(), "nf_modules/@acme/shapes/nanoforge.manifest.json"))).toBe(
      true,
    );
  });

  it("fails on an unknown package", async () => {
    const result = await new InstallAction().handle(
      input({ names: ["@acme/nope"] }),
      input({ directory: project() }),
    );

    expect(result.success).toBe(false);
  });
});

describe("PublishAction", () => {
  beforeEach(() => {
    writeJson(join(dir, "nanoforge.manifest.json"), {
      name: "@acme/kit",
      version: "1.2.0",
      type: "package",
    });
    writeFileSync(join(dir, ".nanoforgerc"), "apiKey=secret-key\n");
    writeFileSync(join(dir, ".env"), "SECRET=1");
    writeJson(join(dir, "src/index.ts"), {});
    writeJson(join(dir, "node_modules/x/package.json"), {});
    writeJson(join(dir, ".git/HEAD"), {});
  });

  it("puts the folder, without secrets nor installed folders, with the saved key", async () => {
    stubFetch(() => new Response(null, { status: 201 }));

    const result = await new PublishAction().handle(new Map(), input({ directory: dir }));

    expect(result.success).toBe(true);
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({
      url: "https://api.nanoforge.eu/registry/@acme/kit",
      method: "PUT",
      authorization: "Bearer secret-key",
    });
    const archive = (seen[0]?.body as FormData).get("archive") as File;
    const files = readArchive(new Uint8Array(await archive.arrayBuffer()));
    expect([...files.keys()].sort()).toEqual(["nanoforge.manifest.json", "src/index.ts"]);
  });

  it("packs only normal files when secrets sit next to them", async () => {
    for (const secret of [".npmrc", "id_rsa", "key.pem"]) writeFileSync(join(dir, secret), "x");
    stubFetch(() => new Response(null, { status: 201 }));

    await new PublishAction().handle(new Map(), input({ directory: dir }));

    const archive = (seen[0]?.body as FormData).get("archive") as File;
    const files = readArchive(new Uint8Array(await archive.arrayBuffer()));
    expect([...files.keys()].sort()).toEqual(["nanoforge.manifest.json", "src/index.ts"]);
  });

  it("lists the packed files and publishes nothing with --dry-run", async () => {
    rmSync(join(dir, ".nanoforgerc"));
    vi.stubEnv("XDG_CONFIG_HOME", dir);
    stubFetch(() => new Response(null, { status: 201 }));
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    try {
      const result = await new PublishAction().handle(
        new Map(),
        input({ directory: dir, dryRun: true }),
      );

      expect(result.success).toBe(true);
      const printed = info.mock.calls.map(([line]) => String(line));
      expect(printed).toContain("  src/index.ts (2 B)");
      expect(printed.some((line) => line.includes("@acme/kit@1.2.0: 2 files"))).toBe(true);
      expect(printed.join("\n")).not.toContain(".env");
    } finally {
      info.mockRestore();
      vi.unstubAllEnvs();
    }
    expect(seen).toHaveLength(0);
  });

  it("refuses an old-format manifest before any request", async () => {
    writeJson(join(dir, "nanoforge.manifest.json"), { name: "acme/kit", type: "component" });
    stubFetch(() => new Response(null, { status: 201 }));

    await expect(new PublishAction().handle(new Map(), input({ directory: dir }))).rejects.toThrow(
      /Manifest Error/,
    );
    expect(seen).toHaveLength(0);
  });

  it("refuses without a saved key", async () => {
    rmSync(join(dir, ".nanoforgerc"));
    vi.stubEnv("XDG_CONFIG_HOME", dir);
    stubFetch(() => new Response(null, { status: 201 }));
    try {
      await expect(
        new PublishAction().handle(new Map(), input({ directory: dir })),
      ).rejects.toThrow(/logged in/);
    } finally {
      vi.unstubAllEnvs();
    }
    expect(seen).toHaveLength(0);
  });

  it("fails when the registry refuses the version", async () => {
    stubFetch(() => Response.json({ message: "1.2.0 exists" }, { status: 409 }));

    const result = await new PublishAction().handle(new Map(), input({ directory: dir }));

    expect(result).toMatchObject({ success: false, error: { code: "CONFLICT" } });
  });
});

describe("UnpublishAction", () => {
  it("deletes the archive of the version the manifest names", async () => {
    writeJson(join(dir, "nanoforge.manifest.json"), {
      name: "@acme/kit",
      version: "1.2.0",
      type: "package",
    });
    writeFileSync(join(dir, ".nanoforgerc"), "apiKey=secret-key\n");
    stubFetch(() => Response.json({ ok: true }));

    const result = await new UnpublishAction().handle(new Map(), input({ directory: dir }));

    expect(result.success).toBe(true);
    expect(seen).toEqual([
      expect.objectContaining({
        url: "https://api.nanoforge.eu/registry/@acme/kit/-/kit-1.2.0.zip",
        method: "DELETE",
        authorization: "Bearer secret-key",
      }),
    ]);
  });
});

describe("LoginAction", () => {
  it("checks the key with whoami, then saves it", async () => {
    stubFetch(() => Response.json({ username: "acme", scopes: ["acme"] }));

    await new LoginAction().handle(
      new Map(),
      input({ directory: dir, local: true, apiKey: "new-key" }),
    );

    expect(seen[0]).toMatchObject({
      url: "https://api.nanoforge.eu/registry/-/whoami",
      authorization: "Bearer new-key",
    });
    expect(readFileSync(join(dir, ".nanoforgerc"), "utf-8")).toContain("new-key");
  });

  it("saves nothing when the registry refuses the key", async () => {
    stubFetch(() => Response.json({ message: "expired" }, { status: 401 }));

    await expect(
      new LoginAction().handle(new Map(), input({ directory: dir, local: true, apiKey: "bad" })),
    ).rejects.toMatchObject({ code: "INVALID" });
    expect(existsSync(join(dir, ".nanoforgerc"))).toBe(false);
  });
});
