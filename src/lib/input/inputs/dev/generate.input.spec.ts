import { describe, expect, it } from "vitest";

import { type Input } from "../../input.type";
import { getDevGenerateInput } from "./generate.input";

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getDevGenerateInput", () => {
  it("should return the generate value when provided", () => {
    const input = createInput([["generate", true]]);
    expect(getDevGenerateInput(input)).toBe(true);
  });

  it("should return false as default when generate is missing", () => {
    const input = createInput([]);
    expect(getDevGenerateInput(input)).toBe(false);
  });
});
