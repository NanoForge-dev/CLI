import { describe, expect, it } from "vitest";

import { type Input } from "../input.type";
import { getEditorInput } from "./editor.input";

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getEditorInput", () => {
  it("should return the editor value when provided", () => {
    const input = createInput([["editor", true]]);
    expect(getEditorInput(input)).toBe(true);
  });

  it("should return false as default when editor is missing", () => {
    const input = createInput([]);
    expect(getEditorInput(input)).toBe(false);
  });
});
