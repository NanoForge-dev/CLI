import { input } from "@inquirer/prompts";
import { describe, expect, it, vi } from "vitest";

import { askInput, askInputArray } from "./input.question";

vi.mock("@inquirer/prompts", () => ({
  input: vi.fn(),
}));

describe("askInput", () => {
  it("should call input with the question message", async () => {
    vi.mocked(input).mockResolvedValue("my-app");

    await askInput("Project name?");

    expect(input).toHaveBeenCalledWith(expect.objectContaining({ message: "Project name?" }));
  });

  it("should return the input value", async () => {
    vi.mocked(input).mockResolvedValue("my-app");

    expect(await askInput("Name?")).toBe("my-app");
  });

  it("should default required to false", async () => {
    vi.mocked(input).mockResolvedValue("");

    await askInput("Name?");

    expect(input).toHaveBeenCalledWith(expect.objectContaining({ required: false }));
  });

  it("should pass required option", async () => {
    vi.mocked(input).mockResolvedValue("value");

    await askInput("Name?", { required: true });

    expect(input).toHaveBeenCalledWith(expect.objectContaining({ required: true }));
  });

  it("should pass default option", async () => {
    vi.mocked(input).mockResolvedValue("default-val");

    await askInput("Name?", { default: "default-val" });

    expect(input).toHaveBeenCalledWith(expect.objectContaining({ default: "default-val" }));
  });
});

describe("askInputArray", () => {
  it("should split the result by space by default", async () => {
    vi.mocked(input).mockResolvedValue("lib-a lib-b lib-c");

    const result = await askInputArray("Libraries?");

    expect(result).toEqual(["lib-a", "lib-b", "lib-c"]);
  });

  it("should split by custom separator", async () => {
    vi.mocked(input).mockResolvedValue("a,b,c");

    const result = await askInputArray("Items?", { split: "," });

    expect(result).toEqual(["a", "b", "c"]);
  });

  it("should filter empty strings by default", async () => {
    vi.mocked(input).mockResolvedValue("a  b");

    const result = await askInputArray("Items?");

    expect(result).toEqual(["a", "b"]);
  });

  it("should keep empty strings when filter is false", async () => {
    vi.mocked(input).mockResolvedValue("a  b");

    const result = await askInputArray("Items?", { filter: false });

    expect(result).toEqual(["a", "", "b"]);
  });

  it("should return empty array for empty input when filter is true", async () => {
    vi.mocked(input).mockResolvedValue("");

    const result = await askInputArray("Items?");

    expect(result).toEqual([]);
  });
});
