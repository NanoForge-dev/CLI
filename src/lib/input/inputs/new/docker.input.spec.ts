import { describe, expect, it, vi } from "vitest";

import { askConfirm } from "@lib/question";

import { type Input } from "../../input.type";
import { getDockerOrAsk } from "./docker.input";

vi.mock("@lib/question", () => ({
  askConfirm: vi.fn(),
}));

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getDockerOrAsk", () => {
  it("should return the docker input when provided", async () => {
    const input = createInput([["docker", true]]);

    expect(await getDockerOrAsk(input)).toBe(true);
    expect(askConfirm).not.toHaveBeenCalled();
  });

  it("should call askConfirm when docker is not provided", async () => {
    vi.mocked(askConfirm).mockResolvedValue(false);
    const input = createInput([]);

    expect(await getDockerOrAsk(input)).toBe(false);
    expect(askConfirm).toHaveBeenCalledOnce();
  });
});
