import { describe, expect, it } from "vitest";

import { type Input } from "../../input.type";
import { getNewLintInput } from "./lint.input";

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getNewLintInput", () => {
  it("should return the lint value when provided", () => {
    const input = createInput([["lint", false]]);
    expect(getNewLintInput(input)).toBe(false);
  });

  it("should return false as default when lint is missing", () => {
    const input = createInput([]);
    expect(getNewLintInput(input)).toBe(true);
  });
});
