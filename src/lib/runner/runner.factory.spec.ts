import { describe, expect, it } from "vitest";

import { Runner } from "./runner";
import { RunnerFactory } from "./runner.factory";
import { BunRunner } from "./runners/bun.runner";
import { LocalBunRunner } from "./runners/local-bun.runner";
import { NpmRunner } from "./runners/npm.runner";
import { PnpmRunner } from "./runners/pnpm.runner";
import { SchematicRunner } from "./runners/schematic.runner";
import { YarnRunner } from "./runners/yarn.runner";

describe("RunnerFactory", () => {
  it("should create a BunRunner", () => {
    expect(RunnerFactory.create(Runner.BUN)).toBeInstanceOf(BunRunner);
  });

  it("should create a LocalBunRunner", () => {
    expect(RunnerFactory.create(Runner.LOCAL_BUN)).toBeInstanceOf(LocalBunRunner);
  });

  it("should create a NpmRunner", () => {
    expect(RunnerFactory.create(Runner.NPM)).toBeInstanceOf(NpmRunner);
  });

  it("should create a PnpmRunner", () => {
    expect(RunnerFactory.create(Runner.PNPM)).toBeInstanceOf(PnpmRunner);
  });

  it("should create a SchematicRunner", () => {
    expect(RunnerFactory.create(Runner.SCHEMATIC)).toBeInstanceOf(SchematicRunner);
  });

  it("should create a YarnRunner", () => {
    expect(RunnerFactory.create(Runner.YARN)).toBeInstanceOf(YarnRunner);
  });

  it("should throw for unsupported runner", () => {
    expect(() => RunnerFactory.create(999 as Runner)).toThrow("Unsupported runner: 999");
  });
});
