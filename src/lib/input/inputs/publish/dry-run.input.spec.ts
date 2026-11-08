import { describe, expect, it } from "vitest";

import { type Input } from "../../input.type";
import { getDryRunInput } from "./dry-run.input";

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getDryRunInput", () => {
  it("should return the dryRun value when provided", () => {
    expect(getDryRunInput(createInput([["dryRun", true]]))).toBe(true);
  });

  it("should return false as default when dryRun is missing", () => {
    expect(getDryRunInput(createInput([]))).toBe(false);
  });
});
