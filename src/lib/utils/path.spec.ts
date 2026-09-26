import { basename, isAbsolute, resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { getCwd, getModulePath } from "./path";

describe("getCwd", () => {
  it("should resolve a relative directory to an absolute path", () => {
    expect(getCwd("my-project")).toBe(resolve("my-project"));
  });

  it("should return an absolute path unchanged", () => {
    const absolutePath = resolve("tmp", "my-project");
    expect(getCwd(absolutePath)).toBe(absolutePath);
  });

  it("should resolve '.' to current working directory", () => {
    expect(getCwd(".")).toBe(resolve("."));
  });
});

describe("getModulePath", () => {
  it("should convert a resolved file URL to a native absolute path", () => {
    const path = getModulePath("./path.ts");

    expect(isAbsolute(path)).toBe(true);
    expect(path).not.toMatch(/^file:/);
    expect(basename(path)).toBe("path.ts");
  });

  it("should return the containing directory when requested", () => {
    const path = getModulePath("./path.ts", true);

    expect(isAbsolute(path)).toBe(true);
    expect(basename(path)).toBe("utils");
  });
});
