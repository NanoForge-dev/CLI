import { basename } from "node:path";
import { describe, expect, it } from "vitest";

import { resolvePackageName } from "./name";

describe("resolvePackageName", () => {
  it("should return the base filename for a simple path", () => {
    expect(resolvePackageName("my-package")).toBe("my-package");
  });

  it("should return the base filename from a nested path", () => {
    expect(resolvePackageName("some/path/my-package")).toBe("my-package");
  });

  it("should return scoped package name when path starts with @", () => {
    expect(resolvePackageName("@scope/my-package")).toBe("@scope/my-package");
  });

  it("should return cwd basename when path is '.'", () => {
    const expected = basename(process.cwd());
    expect(resolvePackageName(".")).toBe(expected);
  });
});
