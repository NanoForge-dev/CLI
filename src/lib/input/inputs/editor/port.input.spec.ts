import { describe, expect, it } from "vitest";

import { InvalidCommandArgumentError } from "@utils/errors";

import { type Input } from "../../input.type";
import { DEFAULT_EDITOR_PORT, getEditorPortInput, parsePort } from "./port.input";

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

  it("should reject invalid ports with a cli error, not a plain error", () => {
    expect(() => getEditorPortInput(createInput([["port", "http"]]))).toThrow(
      InvalidCommandArgumentError,
    );
    expect(() => getEditorPortInput(createInput([["port", "70000"]]))).toThrow(
      "an integer from 1 to 65535, got '70000'",
    );
  });
});

describe("parsePort", () => {
  it("accepts 1 to 65535", () => {
    expect(parsePort("1")).toBe(1);
    expect(parsePort("65535")).toBe(65535);
  });

  it.each(["0", "65536", "abc", "", "3000.5", " 3000", "-1", "1e3"])("rejects '%s'", (raw) => {
    expect(() => parsePort(raw)).toThrow(InvalidCommandArgumentError);
  });
});
