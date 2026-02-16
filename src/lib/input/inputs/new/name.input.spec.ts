import { describe, expect, it, vi } from "vitest";

import { askInput } from "@lib/question";

import { type Input } from "../../input.type";
import { getNewNameInputOrAsk } from "./name.input";

vi.mock("@lib/question", () => ({
  askInput: vi.fn(),
}));

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getNewNameInputOrAsk", () => {
  it("should return the name input when provided", async () => {
    const input = createInput([["name", "my-project"]]);

    expect(await getNewNameInputOrAsk(input)).toBe("my-project");
    expect(askInput).not.toHaveBeenCalled();
  });

  it("should call askInput when name is not provided", async () => {
    vi.mocked(askInput).mockResolvedValue("asked-name");
    const input = createInput([]);

    expect(await getNewNameInputOrAsk(input)).toBe("asked-name");
    expect(askInput).toHaveBeenCalledOnce();
  });
});
