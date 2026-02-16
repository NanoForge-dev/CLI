import { describe, expect, it } from "vitest";

import { type Input } from "../input.type";
import { getConfigInput } from "./config.input";

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getConfigInput", () => {
  it("should return the config value when provided", () => {
    const input = createInput([["config", "/custom/path"]]);
    expect(getConfigInput(input)).toBe("/custom/path");
  });

  it("should return '.' as default when config is missing", () => {
    const input = createInput([]);
    expect(getConfigInput(input)).toBe(".");
  });
});
