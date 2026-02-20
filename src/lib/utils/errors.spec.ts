import { describe, expect, it, vi } from "vitest";

import { promptError } from "./errors";

describe("promptError", () => {
  it("should exit process on ExitPromptError", () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    const error = new Error("exit");
    error.name = "ExitPromptError";

    expect(() => promptError(error)).toThrow("process.exit called");
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it("should re-throw non-ExitPromptError errors", () => {
    const error = new Error("something went wrong");

    expect(() => promptError(error)).toThrow("something went wrong");
  });
});
