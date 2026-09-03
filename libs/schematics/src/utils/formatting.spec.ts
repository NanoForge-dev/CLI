import { describe, expect, it } from "vitest";

import { toCamelCase, toKebabCase, toPascalCase } from "./formatting";

describe("toKebabCase", () => {
  it("should convert camelCase to kebab-case", () => {
    expect(toKebabCase("myVariableName")).toBe("my-variable-name");
  });

  it("should convert PascalCase to kebab-case", () => {
    expect(toKebabCase("MyVariableName")).toBe("my-variable-name");
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

describe("toPascalCase", () => {
  it("should convert camelCase to PascalCase", () => {
    expect(toPascalCase("myVariableName")).toBe("MyVariableName");
  });

  it("should convert kebab-case to PascalCase", () => {
    expect(toPascalCase("my-variable-name")).toBe("MyVariableName");
  });

  it("should convert snake_case to PascalCase", () => {
    expect(toPascalCase("my_variable_name")).toBe("MyVariableName");
  });

  it("should convert spaces to PascalCase", () => {
    expect(toPascalCase("my variable name")).toBe("MyVariableName");
  });

  it("should handle already PascalCase string", () => {
    expect(toPascalCase("MyVariableName")).toBe("MyVariableName");
  });

  it("should handle a single word", () => {
    expect(toPascalCase("hello")).toBe("Hello");
  });

  it("should handle an empty string", () => {
    expect(toPascalCase("")).toBe("");
  });

  it("should handle SCREAMING_SNAKE_CASE", () => {
    expect(toPascalCase("MY_VARIABLE_NAME")).toBe("MyVariableName");
  });
});

describe("toCamelCase", () => {
  it("should convert kebab-case to camelCase", () => {
    expect(toCamelCase("my-variable-name")).toBe("myVariableName");
  });

  it("should convert snake_case to camelCase", () => {
    expect(toCamelCase("my_variable_name")).toBe("myVariableName");
  });

  it("should convert spaces to camelCase", () => {
    expect(toCamelCase("my variable name")).toBe("myVariableName");
  });

  it("should handle already camelCase string", () => {
    expect(toCamelCase("myVariableName")).toBe("myVariableName");
  });

  it("should convert PascalCase to camelCase", () => {
    expect(toCamelCase("MyVariableName")).toBe("myVariableName");
  });

  it("should handle a single word", () => {
    expect(toCamelCase("hello")).toBe("hello");
  });

  it("should handle an empty string", () => {
    expect(toCamelCase("")).toBe("");
  });

  it("should handle SCREAMING_SNAKE_CASE", () => {
    expect(toCamelCase("MY_VARIABLE_NAME")).toBe("myVariableName");
  });
});
