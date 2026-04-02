import { describe, expect, it } from "vitest";

import { type Input } from "../input.type";
import { getPathInput, getPathInputWithDefault } from "./path.input";

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getPathInput", () => {
  it("should return the path value when provided", () => {
    const input = createInput([["path", "/custom/path"]]);
    expect(getPathInput(input)).toBe("/custom/path");
  });

  it("should return undefined when path is missing", () => {
    const input = createInput([]);
    expect(getPathInput(input)).toBeUndefined();
  });
});

describe("getPathInputWithDefault", () => {
  it("should return the path value when provided", () => {
    const input = createInput([["path", "/custom/path"]]);
    expect(getPathInputWithDefault(input, "/default/path")).toBe("/custom/path");
  });

  it("should return undefined when path is missing", () => {
    const input = createInput([]);
    expect(getPathInputWithDefault(input, "/default/path")).toBe("/default/path");
  });
});
