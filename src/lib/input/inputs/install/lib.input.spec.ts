import { describe, expect, it } from "vitest";

import { type Input } from "../../input.type";
import { getInstallLibInput } from "./lib.input";

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getInstallLibInput", () => {
  it("should return the lib value when provided", () => {
    const input = createInput([["lib", true]]);
    expect(getInstallLibInput(input)).toBe(true);
  });

  it("should return false as default when lib is missing", () => {
    const input = createInput([]);
    expect(getInstallLibInput(input)).toBe(false);
  });
});
