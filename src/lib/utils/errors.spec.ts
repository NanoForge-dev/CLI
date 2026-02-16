import { describe, expect, it, vi } from "vitest";

import { promptError } from "./errors";

describe("promptError", () => {
  it("should exit process on ExitPromptError", () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    const error = new Error("exit");
    error.name = "ExitPromptError";

    promptError(error);

    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it("should re-throw non-ExitPromptError errors", () => {
    const error = new Error("something went wrong");

    expect(() => promptError(error)).toThrow("something went wrong");
  });
});
