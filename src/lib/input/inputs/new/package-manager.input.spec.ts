import { describe, expect, it, vi } from "vitest";

import { askSelect } from "@lib/question";

import { type Input } from "../../input.type";
import { getNewPackageManagerInputOrAsk } from "./package-manager.input";

vi.mock("@lib/question", () => ({
  askSelect: vi.fn(),
}));

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getNewPackageManagerInputOrAsk", () => {
  it("should return the package manager input when provided", async () => {
    const input = createInput([["packageManager", "pnpm"]]);

    expect(await getNewPackageManagerInputOrAsk(input)).toBe("pnpm");
    expect(askSelect).not.toHaveBeenCalled();
  });

  it("should call askSelect when package manager is not provided", async () => {
    vi.mocked(askSelect).mockResolvedValue("bun");
    const input = createInput([]);

    expect(await getNewPackageManagerInputOrAsk(input)).toBe("bun");
    expect(askSelect).toHaveBeenCalledOnce();
  });
});
