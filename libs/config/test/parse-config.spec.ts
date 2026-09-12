import { describe, expect, it } from "vitest";

import { ConfigParseError, parseConfig } from "../src";

const fixture = (name: string) => new URL(`./parse/fixtures/${name}`, import.meta.url);

describe("parseConfig", () => {
  it("resolves a .ts config file into a fully-defaulted config", async () => {
    const resolved = await parseConfig(fixture("valid-config.ts"));
    expect(resolved.type).toBe("client");
    expect(resolved).toMatchObject({
      entryFile: "custom.ts",
      out: { dir: "dist", mainFile: "main.js" },
      libs: [],
    });
  });

  it("resolves a .js config file the same way as .ts", async () => {
    const resolved = await parseConfig(fixture("valid-config.js"));
    expect(resolved).toEqual({ type: "workspace", packages: ["apps/*"] });
  });

  it("rejects with code 'not-found' when the file doesn't exist", async () => {
    await expect(parseConfig(fixture("missing-config.ts"))).rejects.toMatchObject({
      constructor: ConfigParseError,
      code: "not-found",
    });
  });

  it("rejects with code 'load-failed' when the file throws while loading", async () => {
    const error = await parseConfig(fixture("throwing-config.ts")).catch((e) => e);
    expect(error).toMatchObject({ constructor: ConfigParseError, code: "load-failed" });
    expect(error.cause).toBeInstanceOf(Error);
  });

  it("rejects with code 'no-default-export' when there's no default export", async () => {
    await expect(parseConfig(fixture("no-default-export.ts"))).rejects.toMatchObject({
      constructor: ConfigParseError,
      code: "no-default-export",
    });
  });

  it("rejects with code 'invalid-type' when the type is unrecognized", async () => {
    await expect(parseConfig(fixture("invalid-type-config.ts"))).rejects.toMatchObject({
      constructor: ConfigParseError,
      code: "invalid-type",
    });
  });
});
