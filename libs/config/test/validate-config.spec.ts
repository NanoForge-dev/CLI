import { describe, expect, it } from "vitest";

import { ConfigParseError } from "../src";
import { assertNanoforgeConfig } from "../src/parse/validate-config";

const withOutDir = (dir: string) => ({ type: "client", out: { dir } });

describe("assertNanoforgeConfig out.dir", () => {
  it.each(["", ".", "./", "..", "../dist", "a/../..", "src/..", "/tmp/dist"])(
    "should reject %j",
    (dir) => {
      expect(() => assertNanoforgeConfig(withOutDir(dir), "nanoforge.config.ts")).toThrow(
        ConfigParseError,
      );
    },
  );

  it.each(["dist", "./dist", "build/client", "..dist"])("should accept %j", (dir) => {
    expect(() => assertNanoforgeConfig(withOutDir(dir), "nanoforge.config.ts")).not.toThrow();
  });
});
