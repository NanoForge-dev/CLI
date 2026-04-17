import { beforeEach, describe, expect, it, vi } from "vitest";

import { askInput } from "@lib/question";

import { type Input } from "../../input.type";
import { getNewGitRemoteInputOrAsk } from "./git-remote.input";

vi.mock("@lib/question", () => ({
  askInput: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getNewGitRemoteInputOrAsk", () => {
  it("should return the git remote input when provided", async () => {
    const input = createInput([["gitRemote", "my-project"]]);

    expect(await getNewGitRemoteInputOrAsk(input)).toBe("my-project");
    expect(askInput).not.toHaveBeenCalled();
  });

  it("should call askInput when git remote is not provided", async () => {
    vi.mocked(askInput).mockResolvedValue("asked-git-remote");
    const input = createInput([]);

    expect(await getNewGitRemoteInputOrAsk(input)).toBe("asked-git-remote");
    expect(askInput).toHaveBeenCalledOnce();
  });
});
