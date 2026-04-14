import { describe, expect, it } from "vitest";

import { type Input } from "../../input.type";
import { getEditorOpenInput } from "./open.input";

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getEditorOpenInput", () => {
  it("should return the open value when provided", () => {
    const input = createInput([["open", false]]);
    expect(getEditorOpenInput(input, true)).toBe(false);
  });

  it("should return false as default when open is missing", () => {
    const input = createInput([]);
    expect(getEditorOpenInput(input, true)).toBe(true);
  });
});
