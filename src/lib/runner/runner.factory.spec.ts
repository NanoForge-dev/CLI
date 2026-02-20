import { describe, expect, it } from "vitest";

import { Runner } from "./runner";
import { RunnerFactory } from "./runner.factory";

describe("RunnerFactory", () => {
  it("should create a Runner with the given binary", () => {
    const runner = RunnerFactory.create("node");
    expect(runner).toBeInstanceOf(Runner);
    expect(runner.fullCommand(["--version"])).toBe("node --version");
  });

  it("should create a Runner with binary and args", () => {
    const runner = RunnerFactory.create("node", ["--experimental"]);
    expect(runner).toBeInstanceOf(Runner);
    expect(runner.fullCommand(["script.js"])).toBe("node --experimental script.js");
  });

  it("should create a local runner", () => {
    const runner = RunnerFactory.create("npm");
    expect(runner).toBeInstanceOf(Runner);
    expect(runner.fullCommand(["install"])).toBe("npm install");
  });

  it("should create a schematic runner", () => {
    const runner = RunnerFactory.createSchematic();
    expect(runner).toBeInstanceOf(Runner);
  });
});
