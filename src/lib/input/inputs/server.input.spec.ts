import { describe, expect, it } from "vitest";

import { type Input } from "../input.type";
import { getServerInput } from "./server.input";

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getServerInput", () => {
  it("should return the server value when provided", () => {
    const input = createInput([["server", true]]);
    expect(getServerInput(input)).toBe(true);
  });

  it("should return false as default when server is missing", () => {
    const input = createInput([]);
    expect(getServerInput(input)).toBe(false);
  });
});
