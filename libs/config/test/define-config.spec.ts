import { describe, expect, it } from "vitest";

import { defineConfig } from "../src";
import type { NanoforgeConfig } from "../src";

describe("defineConfig", () => {
  it("returns the given config unchanged", () => {
    const config = defineConfig({ type: "client", libs: ["../libs/test-lib"] });
    expect(config).toEqual({ type: "client", libs: ["../libs/test-lib"] });
  });

  it("narrows to the matching config shape via the type discriminant", () => {
    const config: NanoforgeConfig = defineConfig({ type: "server" });
    if (config.type === "server") {
      expect(config.libs).toBeUndefined();
    } else {
      throw new Error("expected type to be 'server'");
    }
  });
});
