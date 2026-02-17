import { describe, expect, it, vi } from "vitest";

import { askConfirm } from "@lib/question";

import { type Input } from "../../input.type";
import { getNewStrictOrAsk } from "./strict.input";

vi.mock("@lib/question", () => ({
  askConfirm: vi.fn(),
}));

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getNewStrictOrAsk", () => {
  it("should return the strict input when provided", async () => {
    const input = createInput([["strict", false]]);

    expect(await getNewStrictOrAsk(input)).toBe(false);
    expect(askConfirm).not.toHaveBeenCalled();
  });

  it("should call askConfirm when strict is not provided", async () => {
    vi.mocked(askConfirm).mockResolvedValue(true);
    const input = createInput([]);

    expect(await getNewStrictOrAsk(input)).toBe(true);
    expect(askConfirm).toHaveBeenCalledOnce();
  });
});
