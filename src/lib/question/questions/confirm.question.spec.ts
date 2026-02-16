import { confirm } from "@inquirer/prompts";
import { describe, expect, it, vi } from "vitest";

import { askConfirm } from "./confirm.question";

vi.mock("@inquirer/prompts", () => ({
  confirm: vi.fn(),
}));

describe("askConfirm", () => {
  it("should call confirm with the question message", async () => {
    vi.mocked(confirm).mockResolvedValue(true);

    await askConfirm("Continue?");

    expect(confirm).toHaveBeenCalledWith(expect.objectContaining({ message: "Continue?" }));
  });

  it("should return the confirmed value", async () => {
    vi.mocked(confirm).mockResolvedValue(true);
    expect(await askConfirm("Yes?")).toBe(true);

    vi.mocked(confirm).mockResolvedValue(false);
    expect(await askConfirm("No?")).toBe(false);
  });

  it("should default to false when no options provided", async () => {
    vi.mocked(confirm).mockResolvedValue(false);

    await askConfirm("Continue?");

    expect(confirm).toHaveBeenCalledWith(expect.objectContaining({ default: false }));
  });

  it("should use custom default when provided", async () => {
    vi.mocked(confirm).mockResolvedValue(true);

    await askConfirm("Continue?", { default: true });

    expect(confirm).toHaveBeenCalledWith(expect.objectContaining({ default: true }));
  });
});
