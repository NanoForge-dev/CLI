import { describe, expect, it, vi } from "vitest";

import { askSelect } from "@lib/question";

import { type Input } from "../../input.type";
import { getNewLanguageInputOrAsk } from "./language.input";

vi.mock("@lib/question", () => ({
  askSelect: vi.fn(),
}));

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getNewLanguageInputOrAsk", () => {
  it("should return the language input when provided", async () => {
    const input = createInput([["language", "ts"]]);

    expect(await getNewLanguageInputOrAsk(input)).toBe("ts");
    expect(askSelect).not.toHaveBeenCalled();
  });

  it("should call askSelect when language is not provided", async () => {
    vi.mocked(askSelect).mockResolvedValue("js");
    const input = createInput([]);

    expect(await getNewLanguageInputOrAsk(input)).toBe("js");
    expect(askSelect).toHaveBeenCalledOnce();
  });
});
