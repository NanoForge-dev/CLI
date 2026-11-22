import { resolve } from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type Input } from "@lib/input";
import { PackageManagerFactory } from "@lib/package-manager";

import { DevAction } from "./dev.action";

vi.mock("@lib/package-manager", () => ({
  PackageManagerFactory: { find: vi.fn() },
}));

const GAME = resolve("game");

const createInput = (entries: [string, any][]): Input =>
  new Map(entries.map(([key, value]) => [key, { value }]));

describe("DevAction", () => {
  const runDev = vi.fn().mockResolvedValue(true);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(PackageManagerFactory.find).mockResolvedValue({ runDev } as any);
  });

  it("runs build and start in watch mode with their output shown, not collected", async () => {
    await new DevAction().handle(new Map(), createInput([["directory", GAME]]));

    expect(runDev).toHaveBeenCalledWith(GAME, "nf", {}, ["build", "--watch"], false);
    expect(runDev).toHaveBeenCalledWith(GAME, "nf", {}, ["start", "--watch"], false);
  });

  it("passes --editor to the build only", async () => {
    await new DevAction().handle(
      new Map(),
      createInput([
        ["directory", GAME],
        ["editor", true],
      ]),
    );

    expect(runDev).toHaveBeenCalledWith(GAME, "nf", {}, ["build", "--watch", "--editor"], false);
    expect(runDev).toHaveBeenCalledWith(GAME, "nf", {}, ["start", "--watch"], false);
  });
});
