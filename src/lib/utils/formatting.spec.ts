import { describe, expect, it } from "vitest";

import { toKebabCase } from "./formatting";

describe("toKebabCase", () => {
  it("should convert camelCase to kebab-case", () => {
    expect(toKebabCase("myVariableName")).toBe("my-variable-name");
  });

  it("should convert PascalCase to kebab-case", () => {
    expect(toKebabCase("MyVariableName")).toBe("-my-variable-name");
  });

  it("should convert spaces to hyphens", () => {
    expect(toKebabCase("my variable name")).toBe("my-variable-name");
  });

  it("should convert underscores to hyphens", () => {
    expect(toKebabCase("my_variable_name")).toBe("my-variable-name");
  });

  it("should return an already kebab-case string unchanged", () => {
    expect(toKebabCase("my-variable-name")).toBe("my-variable-name");
  });

  it("should handle a single word", () => {
    expect(toKebabCase("hello")).toBe("hello");
  });

  it("should handle an empty string", () => {
    expect(toKebabCase("")).toBe("");
  });
});
