import { resolve } from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type Input } from "@lib/input";
import { RunnerFactory } from "@lib/runner";

import { DevAction } from "./dev.action";

vi.mock("@lib/runner", () => ({
  RunnerFactory: { create: vi.fn() },
}));

const GAME = resolve("game");

const createInput = (entries: [string, any][]): Input =>
  new Map(entries.map(([key, value]) => [key, { value }]));

describe("DevAction", () => {
  const run = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    run.mockResolvedValue(null);
    vi.mocked(RunnerFactory.create).mockReturnValue({ run } as any);
    vi.spyOn(process, "once").mockImplementation((() => process) as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fails as soon as build or start fails, without waiting for the other", async () => {
    run.mockImplementation(([command]: string[]) =>
      command === "start"
        ? Promise.reject(new Error("exited with code 1"))
        : new Promise(() => undefined),
    );

    await expect(
      new DevAction().handle(new Map(), createInput([["directory", GAME]])),
    ).resolves.toMatchObject({ keepAlive: true, success: false });
  });

  it("runs the running CLI itself, never `<pm> exec nf`", async () => {
    await new DevAction().handle(new Map(), createInput([["directory", GAME]]));

    expect(RunnerFactory.create).toHaveBeenCalledWith(process.execPath, [process.argv[1]]);
    expect(RunnerFactory.create).not.toHaveBeenCalledWith(
      expect.stringMatching(/^(npm|pnpm|yarn|bun)$/),
      expect.anything(),
    );
  });

  it("runs build and start in watch mode in the project, with their output shown", async () => {
    await new DevAction().handle(new Map(), createInput([["directory", GAME]]));

    expect(run).toHaveBeenCalledWith(["build", "--watch"], { cwd: GAME });
    expect(run).toHaveBeenCalledWith(["start", "--watch"], { cwd: GAME });
  });

  it("passes --editor to the build only", async () => {
    await new DevAction().handle(
      new Map(),
      createInput([
        ["directory", GAME],
        ["editor", true],
      ]),
    );

    expect(run).toHaveBeenCalledWith(["build", "--watch", "--editor"], { cwd: GAME });
    expect(run).toHaveBeenCalledWith(["start", "--watch"], { cwd: GAME });
  });
});
