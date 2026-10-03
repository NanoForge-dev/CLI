import { describe, expect, it } from "vitest";

import { type Input } from "../../input.type";
import { DEFAULT_EDITOR_PORT, getEditorPortInput } from "./port.input";

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getEditorPortInput", () => {
  it("should return the port when provided", () => {
    expect(getEditorPortInput(createInput([["port", "4100"]]))).toBe(4100);
  });

  it("should default to the editor port", () => {
    expect(getEditorPortInput(createInput([]))).toBe(DEFAULT_EDITOR_PORT);
  });

  it("should reject invalid ports", () => {
    expect(() => getEditorPortInput(createInput([["port", "http"]]))).toThrow(
      "Invalid editor port",
    );
    expect(() => getEditorPortInput(createInput([["port", "70000"]]))).toThrow();
  });
});
