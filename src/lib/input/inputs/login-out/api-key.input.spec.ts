import { describe, expect, it, vi } from "vitest";

import { askInput } from "@lib/question";

import { type Input } from "../../input.type";
import { getLoginApiKeyInputOrAsk } from "./api-key.input";

vi.mock("@lib/question", () => ({
  askInput: vi.fn(),
}));

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getLoginApiKeyInputOrAsk", () => {
  it("should return the apiKey input when provided", async () => {
    const input = createInput([["apiKey", "my-api-key"]]);

    expect(await getLoginApiKeyInputOrAsk(input)).toBe("my-api-key");
    expect(askInput).not.toHaveBeenCalled();
  });

  it("should call askInput when apiKey is not provided", async () => {
    vi.mocked(askInput).mockResolvedValue("asked-api-key");
    const input = createInput([]);

    expect(await getLoginApiKeyInputOrAsk(input)).toBe("asked-api-key");
    expect(askInput).toHaveBeenCalledOnce();
  });
});
