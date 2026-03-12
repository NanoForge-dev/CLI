import { describe, expect, it } from "vitest";

import { type Input } from "../../input.type";
import { getInstallServerInput } from "./server.input";

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getInstallServerInput", () => {
  it("should return the server value when provided", () => {
    const input = createInput([["server", true]]);
    expect(getInstallServerInput(input)).toBe(true);
  });

  it("should return false as default when server is missing", () => {
    const input = createInput([]);
    expect(getInstallServerInput(input)).toBe(false);
  });
});
