import { RegistryError } from "@nanoforge-dev/registry";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConfigNotFoundError, handleActionError, promptError } from "./errors";

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
        new RegistryError("NOT_FOUND", "@acme/nope was not found\u001b[2J\u009b2J\u202e"),
      ),
    ).toThrow("exit");

    const printed = errorSpy.mock.calls.flat().join("\n");
    expect(printed).toContain("@acme/nope was not found");
    const line = printed.split("\n").find((text) => text.includes("@acme/nope")) ?? "";
    for (const control of ["\u001b", "\u009b", "\u202e"]) expect(line).not.toContain(control);
    expect(printed).not.toMatch(/^\s+at /m);
    expect(infoSpy.mock.calls.flat().join("\n")).toContain("Check the package name");
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    errorSpy.mockRestore();
    infoSpy.mockRestore();
  });
});

describe("error suggestions", () => {
  it("points a missing config at -d, not at a --config option", () => {
    const { suggestion } = new ConfigNotFoundError("nanoforge.config.ts");

    expect(suggestion).toContain("-d");
    expect(suggestion).not.toContain("--config");
  });

  it("does not suggest REGISTRY_URL for an unreachable registry", () => {
    vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("exit");
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    expect(() =>
      handleActionError("Install failed!", new RegistryError("UNAVAILABLE", "unreachable")),
    ).toThrow("exit");

    const printed = infoSpy.mock.calls.flat().join("\n");
    expect(printed).toContain("Check your connection and try again.");
    expect(printed).not.toContain("REGISTRY_URL");
    vi.restoreAllMocks();
  });
});

describe("unexpected errors", () => {
  const capture = (error: unknown) => {
    vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("exit");
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    expect(() => handleActionError("Editor failed!", error)).toThrow("exit");
    const printed = {
      error: errorSpy.mock.calls.flat().join("\n"),
      info: infoSpy.mock.calls.flat().join("\n"),
    };
    vi.restoreAllMocks();
    return printed;
  };

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prints the message without the stack trace", () => {
    vi.stubEnv("NF_DEBUG", "");

    const printed = capture(new Error("Something broke"));

    expect(printed.error).toContain("Something broke");
    expect(printed.error).not.toMatch(/^\s+at /m);
    expect(printed.info).toContain("NF_DEBUG=1");
  });

  it("prints the stack trace with NF_DEBUG set", () => {
    vi.stubEnv("NF_DEBUG", "1");

    const printed = capture(new Error("Something broke"));

    expect(printed.error).toMatch(/^\s+at /m);
    expect(printed.info).not.toContain("NF_DEBUG=1");
  });
});
