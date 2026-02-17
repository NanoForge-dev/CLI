import { describe, expect, it, vi } from "vitest";

import { askInputArray } from "@lib/question";

import { type Input } from "../../input.type";
import { getInstallNamesInputOrAsk } from "./names.input";

vi.mock("@lib/question", () => ({
  askInputArray: vi.fn(),
}));

const createInput = (entries: [string, any][]): Input => {
  return new Map(entries.map(([key, value]) => [key, { value }]));
};

describe("getInstallNamesInputOrAsk", () => {
  it("should return the names input when provided", async () => {
    const input = createInput([["names", ["lib-a", "lib-b"]]]);

    expect(await getInstallNamesInputOrAsk(input)).toEqual(["lib-a", "lib-b"]);
    expect(askInputArray).not.toHaveBeenCalled();
  });

  it("should call askInputArray when names is not provided", async () => {
    vi.mocked(askInputArray).mockResolvedValue(["lib-c"]);
    const input = createInput([]);

    expect(await getInstallNamesInputOrAsk(input)).toEqual(["lib-c"]);
    expect(askInputArray).toHaveBeenCalledOnce();
  });
});
