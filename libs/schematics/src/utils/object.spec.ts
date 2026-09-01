import { describe, expect, it } from "vitest";

import { deepMerge, isObject } from "./object";

describe("isObject", () => {
  it("should return true for a plain object", () => {
    expect(isObject({})).toBe(true);
  });

  it("should return true for an object with properties", () => {
    expect(isObject({ a: 1 })).toBe(true);
  });

  it("should return false for an array", () => {
    expect(isObject([1, 2, 3])).toBe(false);
  });

  it("should return falsy for null", () => {
    expect(isObject(null)).toBeFalsy();
  });

  it("should return falsy for undefined", () => {
    expect(isObject(undefined)).toBeFalsy();
  });

  it("should return false for a string", () => {
    expect(isObject("hello")).toBe(false);
  });

  it("should return false for a number", () => {
    expect(isObject(42)).toBe(false);
  });
});

describe("deepMerge", () => {
  it("should merge flat objects", () => {
    expect(deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it("should override values from source", () => {
    expect(deepMerge({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
  });

  it("should deep merge nested objects", () => {
    const target = { a: { b: 1, c: 2 } };
    const source = { a: { c: 3, d: 4 } };
    expect(deepMerge(target, source)).toEqual({ a: { b: 1, c: 3, d: 4 } });
  });

  it("should handle multiple sources", () => {
    expect(deepMerge({ a: 1 }, { b: 2 }, { c: 3 })).toEqual({ a: 1, b: 2, c: 3 });
  });

  it("should return target when source is empty", () => {
    const target = { a: 1 };
    expect(deepMerge(target, {})).toEqual({ a: 1 });
  });

  it("should create nested keys in target if missing", () => {
    expect(deepMerge({}, { a: { b: 1 } })).toEqual({ a: { b: 1 } });
  });

  it("should not override a primitive with an object when target is not an object", () => {
    expect(deepMerge({ a: 1 }, { a: { b: 2 } })).toEqual({ a: 1 });
  });
});
