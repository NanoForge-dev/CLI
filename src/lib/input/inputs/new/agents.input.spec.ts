import { describe, expect, it } from "vitest";

import { type Input } from "../../input.type";
import { getNewAgentsInput } from "./agents.input";

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getNewAgentsInput", () => {
  it("should return the agents value when provided", () => {
    const input = createInput([["agents", false]]);
    expect(getNewAgentsInput(input)).toBe(false);
  });

  it("should return true as default when agents is missing", () => {
    const input = createInput([]);
    expect(getNewAgentsInput(input)).toBe(true);
  });
});
