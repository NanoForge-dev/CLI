import { describe, expect, it } from "vitest";

import { type Input } from "../input.type";
import { getDirectoryInput } from "./directory.input";

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getDirectoryInput", () => {
  it("should return the directory value when provided", () => {
    const input = createInput([["directory", "/my/dir"]]);
    expect(getDirectoryInput(input)).toBe("/my/dir");
  });

  it("should return '.' as default when directory is missing", () => {
    const input = createInput([]);
    expect(getDirectoryInput(input)).toBe(".");
  });

  it("should return the value without default when withDefault is false", () => {
    const input = createInput([["directory", "/my/dir"]]);
    expect(getDirectoryInput(input, false)).toBe("/my/dir");
  });

  it("should return undefined when missing and withDefault is false", () => {
    const input = createInput([]);
    expect(getDirectoryInput(input, false)).toBeUndefined();
  });
});
