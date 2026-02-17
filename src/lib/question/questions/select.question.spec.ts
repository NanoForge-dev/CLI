import { checkbox, select } from "@inquirer/prompts";
import { describe, expect, it, vi } from "vitest";

import { askMultiSelect, askSelect } from "./select.question";

vi.mock("@inquirer/prompts", () => ({
  select: vi.fn(),
  checkbox: vi.fn(),
}));

describe("askSelect", () => {
  it("should call select with question and choices", async () => {
    vi.mocked(select).mockResolvedValue("ts");

    await askSelect("Language?", ["ts", "js"]);

    expect(select).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Language?",
        choices: ["ts", "js"],
      }),
    );
  });

  it("should return the selected value", async () => {
    vi.mocked(select).mockResolvedValue("pnpm");

    expect(await askSelect("PM?", ["npm", "pnpm"])).toBe("pnpm");
  });

  it("should default loop to true", async () => {
    vi.mocked(select).mockResolvedValue("a");

    await askSelect("Pick?", ["a", "b"]);

    expect(select).toHaveBeenCalledWith(expect.objectContaining({ loop: true }));
  });

  it("should pass custom loop option", async () => {
    vi.mocked(select).mockResolvedValue("a");

    await askSelect("Pick?", ["a", "b"], { loop: false });

    expect(select).toHaveBeenCalledWith(expect.objectContaining({ loop: false }));
  });

  it("should pass default option", async () => {
    vi.mocked(select).mockResolvedValue("ts");

    await askSelect("Language?", ["ts", "js"], { default: "ts" });

    expect(select).toHaveBeenCalledWith(expect.objectContaining({ default: "ts" }));
  });

  it("should work with SelectChoice objects", async () => {
    const choices = [
      { value: "ts", name: "TypeScript" },
      { value: "js", name: "JavaScript" },
    ];
    vi.mocked(select).mockResolvedValue("ts");

    await askSelect("Language?", choices);

    expect(select).toHaveBeenCalledWith(expect.objectContaining({ choices }));
  });
});

describe("askMultiSelect", () => {
  it("should call checkbox with question and choices", async () => {
    vi.mocked(checkbox).mockResolvedValue(["a", "b"]);

    await askMultiSelect("Pick?", ["a", "b", "c"]);

    expect(checkbox).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Pick?",
        choices: ["a", "b", "c"],
      }),
    );
  });

  it("should return selected values", async () => {
    vi.mocked(checkbox).mockResolvedValue(["graphics", "input"]);

    const result = await askMultiSelect("Libs?", ["graphics", "input", "sound"]);

    expect(result).toEqual(["graphics", "input"]);
  });

  it("should default loop to true and required to false", async () => {
    vi.mocked(checkbox).mockResolvedValue([]);

    await askMultiSelect("Pick?", ["a"]);

    expect(checkbox).toHaveBeenCalledWith(expect.objectContaining({ loop: true, required: false }));
  });

  it("should pass custom required option", async () => {
    vi.mocked(checkbox).mockResolvedValue(["a"]);

    await askMultiSelect("Pick?", ["a"], { required: true });

    expect(checkbox).toHaveBeenCalledWith(expect.objectContaining({ required: true }));
  });
});
