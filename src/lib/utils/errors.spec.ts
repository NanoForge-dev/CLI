import { RegistryError } from "@nanoforge-dev/registry";
import { describe, expect, it, vi } from "vitest";

import { handleActionError, promptError } from "./errors";

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

describe("handleActionError", () => {
  it("prints a registry error's message and suggestion, not its stack", () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("exit");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    expect(() =>
      handleActionError(
        "Installation failed!",
        new RegistryError("NOT_FOUND", "@acme/nope was not found\u001b[2J"),
      ),
    ).toThrow("exit");

    const printed = errorSpy.mock.calls.flat().join("\n");
    expect(printed).toContain("@acme/nope was not found");
    expect(printed).not.toContain("\u001b[2J");
    expect(printed).not.toMatch(/^\s+at /m);
    expect(infoSpy.mock.calls.flat().join("\n")).toContain("Check the package name");
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    errorSpy.mockRestore();
    infoSpy.mockRestore();
  });
});
