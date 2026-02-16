import { describe, expect, it } from "vitest";

import {
  getArrayInput,
  getArrayInputWithDefault,
  getBooleanInput,
  getBooleanInputWithDefault,
  getStringInput,
  getStringInputWithDefault,
} from "./base-inputs";
import { type Input } from "./input.type";

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getStringInput", () => {
  it("should return the string value", () => {
    const input = createInput([["name", "my-app"]]);
    expect(getStringInput(input, "name")).toBe("my-app");
  });

  it("should return undefined when field is missing", () => {
    const input = createInput([]);
    expect(getStringInput(input, "name")).toBeUndefined();
  });

  it("should return undefined when value is undefined", () => {
    const input = createInput([["name", undefined]]);
    expect(getStringInput(input, "name")).toBeUndefined();
  });

  it("should throw on non-string value", () => {
    const input = createInput([["name", 42]]);
    expect(() => getStringInput(input, "name")).toThrow("Invalid type for name");
  });
});

describe("getStringInputWithDefault", () => {
  it("should return the value when present", () => {
    const input = createInput([["name", "my-app"]]);
    expect(getStringInputWithDefault(input, "name", "default")).toBe("my-app");
  });

  it("should return default when missing", () => {
    const input = createInput([]);
    expect(getStringInputWithDefault(input, "name", "default")).toBe("default");
  });
});

describe("getBooleanInput", () => {
  it("should return the boolean value", () => {
    const input = createInput([["strict", true]]);
    expect(getBooleanInput(input, "strict")).toBe(true);
  });

  it("should return undefined when missing", () => {
    const input = createInput([]);
    expect(getBooleanInput(input, "strict")).toBeUndefined();
  });

  it("should throw on non-boolean value", () => {
    const input = createInput([["strict", "yes"]]);
    expect(() => getBooleanInput(input, "strict")).toThrow("Invalid type for strict");
  });
});

describe("getBooleanInputWithDefault", () => {
  it("should return the value when present", () => {
    const input = createInput([["strict", false]]);
    expect(getBooleanInputWithDefault(input, "strict", true)).toBe(false);
  });

  it("should return default when missing", () => {
    const input = createInput([]);
    expect(getBooleanInputWithDefault(input, "strict", true)).toBe(true);
  });
});

describe("getArrayInput", () => {
  it("should return the array value", () => {
    const input = createInput([["libs", ["a", "b"]]]);
    expect(getArrayInput(input, "libs")).toEqual(["a", "b"]);
  });

  it("should return undefined when missing", () => {
    const input = createInput([]);
    expect(getArrayInput(input, "libs")).toBeUndefined();
  });

  it("should throw on non-array value", () => {
    const input = createInput([["libs", "not-array"]]);
    expect(() => getArrayInput(input, "libs")).toThrow("Invalid type for libs");
  });
});

describe("getArrayInputWithDefault", () => {
  it("should return the value when present", () => {
    const input = createInput([["libs", ["a"]]]);
    expect(getArrayInputWithDefault(input, "libs", [])).toEqual(["a"]);
  });

  it("should return default when missing", () => {
    const input = createInput([]);
    expect(getArrayInputWithDefault(input, "libs", ["default"])).toEqual(["default"]);
  });
});
