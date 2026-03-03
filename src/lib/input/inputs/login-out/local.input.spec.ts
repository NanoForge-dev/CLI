import { describe, expect, it } from "vitest";

import { type Input } from "../../input.type";
import { getLocalInput } from "./local.input";

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getLocalInput", () => {
  it("should return the local value when provided", () => {
    const input = createInput([["local", true]]);
    expect(getLocalInput(input)).toBe(true);
  });

  it("should return false as default when local is missing", () => {
    const input = createInput([]);
    expect(getLocalInput(input)).toBe(false);
  });
});
