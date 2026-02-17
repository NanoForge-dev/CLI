import { describe, expect, it } from "vitest";

import { type Input } from "../input.type";
import { getWatchInput } from "./watch.input";

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getWatchInput", () => {
  it("should return the watch value when provided", () => {
    const input = createInput([["watch", true]]);
    expect(getWatchInput(input)).toBe(true);
  });

  it("should return false as default when watch is missing", () => {
    const input = createInput([]);
    expect(getWatchInput(input)).toBe(false);
  });
});
