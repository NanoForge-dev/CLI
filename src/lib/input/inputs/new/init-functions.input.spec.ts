import { describe, expect, it } from "vitest";

import { type Input } from "../../input.type";
import { getNewInitFunctionsWithDefault } from "./init-functions.input";

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getNewInitFunctionsWithDefault", () => {
  it("should return the value when provided", () => {
    const input = createInput([["initFunctions", true]]);
    expect(getNewInitFunctionsWithDefault(input)).toBe(true);
  });

  it("should return false as default when missing", () => {
    const input = createInput([]);
    expect(getNewInitFunctionsWithDefault(input)).toBe(false);
  });
});
