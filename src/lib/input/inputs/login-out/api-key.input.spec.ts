import { describe, expect, it, vi } from "vitest";

import { askSecret } from "@lib/question";

import { type Input } from "../../input.type";
import { getLoginApiKeyInputOrAsk } from "./api-key.input";

vi.mock("@lib/question", () => ({
  askSecret: vi.fn(),
}));

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getLoginApiKeyInputOrAsk", () => {
  it("should return the apiKey input when provided", async () => {
    const input = createInput([["apiKey", "my-api-key"]]);

    expect(await getLoginApiKeyInputOrAsk(input)).toBe("my-api-key");
    expect(askSecret).not.toHaveBeenCalled();
  });

  it("should call askSecret when apiKey is not provided", async () => {
    vi.mocked(askSecret).mockResolvedValue("asked-api-key");
    const input = createInput([]);

    expect(await getLoginApiKeyInputOrAsk(input)).toBe("asked-api-key");
    expect(askSecret).toHaveBeenCalledOnce();
  });
});
