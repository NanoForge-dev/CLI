import { number } from "@inquirer/prompts";
import { describe, expect, it, vi } from "vitest";

import { askNumber } from "./number.question";

vi.mock("@inquirer/prompts", () => ({
  number: vi.fn(),
}));

describe("askNumber", () => {
  it("should call number with the question message", async () => {
    vi.mocked(number).mockResolvedValue(42);

    await askNumber("Port?");

    expect(number).toHaveBeenCalledWith(expect.objectContaining({ message: "Port?" }));
  });

  it("should return the numeric value", async () => {
    vi.mocked(number).mockResolvedValue(3000);

    expect(await askNumber("Port?")).toBe(3000);
  });

  it("should pass min, max, step options", async () => {
    vi.mocked(number).mockResolvedValue(5);

    await askNumber("Value?", { min: 1, max: 10, step: 1 });

    expect(number).toHaveBeenCalledWith(expect.objectContaining({ min: 1, max: 10, step: 1 }));
  });

  it("should pass default option", async () => {
    vi.mocked(number).mockResolvedValue(8080);

    await askNumber("Port?", { default: 8080 });

    expect(number).toHaveBeenCalledWith(expect.objectContaining({ default: 8080 }));
  });

  it("should throw on undefined result", async () => {
    vi.mocked(number).mockResolvedValue(undefined as any);

    await expect(askNumber("Port?")).rejects.toThrow("Invalid number");
  });

  it("should throw on NaN result", async () => {
    vi.mocked(number).mockResolvedValue(NaN);

    await expect(askNumber("Port?")).rejects.toThrow("Invalid number");
  });

  it("should throw on Infinity result", async () => {
    vi.mocked(number).mockResolvedValue(Infinity);

    await expect(askNumber("Port?")).rejects.toThrow("Invalid number");
  });
});
