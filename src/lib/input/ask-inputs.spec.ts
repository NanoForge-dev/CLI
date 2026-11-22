import { describe, expect, it, vi } from "vitest";

import { NoTerminalError } from "@utils/errors";

import { getInputOrAsk } from "./ask-inputs";

describe("getInputOrAsk", () => {
  it("should return baseInput when defined", async () => {
    const askCb = vi.fn();

    expect(await getInputOrAsk("hello", askCb)).toBe("hello");
    expect(askCb).not.toHaveBeenCalled();
  });

  it("should call askCb when baseInput is undefined", async () => {
    const askCb = vi.fn().mockResolvedValue("from-ask");

    expect(await getInputOrAsk(undefined, askCb)).toBe("from-ask");
    expect(askCb).toHaveBeenCalledOnce();
  });

  it("should return defaultValue when both baseInput and askCb return undefined", async () => {
    const askCb = vi.fn().mockResolvedValue(undefined);

    expect(await getInputOrAsk(undefined, askCb, undefined, "fallback")).toBe("fallback");
  });

  it("should throw when no input, askCb returns undefined, and no default", async () => {
    const askCb = vi.fn().mockResolvedValue(undefined);

    await expect(getInputOrAsk(undefined, askCb)).rejects.toThrow("No input provided");
  });

  it("should return false baseInput without calling askCb", async () => {
    const askCb = vi.fn();

    expect(await getInputOrAsk(false, askCb)).toBe(false);
    expect(askCb).not.toHaveBeenCalled();
  });

  it("should return empty string baseInput without calling askCb", async () => {
    const askCb = vi.fn();

    expect(await getInputOrAsk("", askCb)).toBe("");
    expect(askCb).not.toHaveBeenCalled();
  });

  it("should return 0 baseInput without calling askCb", async () => {
    const askCb = vi.fn();

    expect(await getInputOrAsk(0, askCb)).toBe(0);
    expect(askCb).not.toHaveBeenCalled();
  });
});

describe("getInputOrAsk without a terminal", () => {
  it("names the missing option", async () => {
    const askCb = vi.fn().mockRejectedValue(new NoTerminalError());

    await expect(getInputOrAsk(undefined, askCb, "--name")).rejects.toThrow(
      "--name is required when not running in a terminal.",
    );
  });

  it("lets other errors through", async () => {
    const askCb = vi.fn().mockRejectedValue(new Error("boom"));

    await expect(getInputOrAsk(undefined, askCb, "--name")).rejects.toThrow("boom");
  });
});
