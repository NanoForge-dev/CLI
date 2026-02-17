import { describe, expect, it } from "vitest";

import { type Input } from "../../input.type";
import { getNewPathInput } from "./path.input";

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getNewPathInput", () => {
  it("should return the path value when provided", () => {
    const input = createInput([["path", "/custom/path"]]);
    expect(getNewPathInput(input)).toBe("/custom/path");
  });

  it("should return undefined when path is missing", () => {
    const input = createInput([]);
    expect(getNewPathInput(input)).toBeUndefined();
  });
});
