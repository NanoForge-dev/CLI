import { describe, expect, it } from "vitest";

import { type Input } from "../../input.type";
import { getCreateTypeInput } from "./type.input";

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getCreateTypeInput", () => {
  it("should return the type input when provided", () => {
    const input = createInput([["type", "component"]]);

    expect(getCreateTypeInput(input)).toBe("component");
  });

  it("should throw when type is not provided", () => {
    const input = createInput([]);

    expect(() => getCreateTypeInput(input)).toThrow();
  });

  it("should throw when type is not a right type", () => {
    const input = createInput([["type", "bad-element"]]);

    expect(() => getCreateTypeInput(input)).toThrow();
  });
});
