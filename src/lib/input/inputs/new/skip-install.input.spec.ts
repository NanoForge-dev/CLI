import { describe, expect, it, vi } from "vitest";

import { askConfirm } from "@lib/question";

import { type Input } from "../../input.type";
import { getNewSkipInstallOrAsk } from "./skip-install.input";

vi.mock("@lib/question", () => ({
  askConfirm: vi.fn(),
}));

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getNewSkipInstallOrAsk", () => {
  it("should return the skipInstall input when provided", async () => {
    const input = createInput([["skipInstall", true]]);

    expect(await getNewSkipInstallOrAsk(input)).toBe(true);
    expect(askConfirm).not.toHaveBeenCalled();
  });

  it("should call askConfirm when skipInstall is not provided", async () => {
    vi.mocked(askConfirm).mockResolvedValue(false);
    const input = createInput([]);

    expect(await getNewSkipInstallOrAsk(input)).toBe(false);
    expect(askConfirm).toHaveBeenCalledOnce();
  });
});
