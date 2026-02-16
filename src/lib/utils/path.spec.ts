import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { getCwd } from "./path";

describe("getCwd", () => {
  it("should resolve a relative directory to an absolute path", () => {
    expect(getCwd("my-project")).toBe(resolve("my-project"));
  });

  it("should return an absolute path unchanged", () => {
    expect(getCwd("/tmp/my-project")).toBe("/tmp/my-project");
  });

  it("should resolve '.' to current working directory", () => {
    expect(getCwd(".")).toBe(resolve("."));
  });
});
