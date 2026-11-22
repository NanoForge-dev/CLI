import { afterEach, describe, expect, it, vi } from "vitest";

import { type Input } from "@lib/input";

import { NewAction } from "./new.action";

type Internals = Record<
  "collectValues" | "scaffold" | "installDependencies" | "setupGitRepository",
  () => unknown
>;

const proto = NewAction.prototype as unknown as Internals;

const run = (values: { git: boolean; skipInstall: boolean }, install: boolean, git: boolean) => {
  vi.spyOn(proto, "collectValues").mockResolvedValue({
    ...values,
    directory: "app",
    gitRemote: "git@example.com:me/app.git",
  });
  vi.spyOn(proto, "scaffold").mockResolvedValue(undefined);
  vi.spyOn(proto, "installDependencies").mockResolvedValue(install);
  const setupGit = vi.spyOn(proto, "setupGitRepository").mockResolvedValue(git);
  return { result: new NewAction().handle(new Map() as Input, new Map() as Input), setupGit };
};

describe("NewAction git setup", () => {
  afterEach(() => vi.restoreAllMocks());

  it("fails when git init or git remote add fails", async () => {
    const { result, setupGit } = run({ git: true, skipInstall: true }, true, false);
    expect(await result).toEqual({ success: false });
    expect(setupGit).toHaveBeenCalledOnce();
  });

  it("succeeds when the git setup succeeds", async () => {
    expect(await run({ git: true, skipInstall: false }, true, true).result).toEqual({
      success: true,
    });
  });

  it("still fails on a failed install when the git setup succeeds", async () => {
    expect(await run({ git: true, skipInstall: false }, false, true).result).toEqual({
      success: false,
    });
  });

  it("does not set up git without --git", async () => {
    const { result, setupGit } = run({ git: false, skipInstall: true }, true, false);
    expect(await result).toEqual({ success: true });
    expect(setupGit).not.toHaveBeenCalled();
  });
});
