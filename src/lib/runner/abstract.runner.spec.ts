import { describe, expect, it } from "vitest";

import { AbstractRunner } from "./abstract.runner";

class TestRunner extends AbstractRunner {
  constructor() {
    super("node", ["--version"]);
  }
}

describe("AbstractRunner", () => {
  describe("rawFullCommand", () => {
    it("should combine binary, base args, and additional args", () => {
      const runner = new TestRunner();
      expect(runner.rawFullCommand(["--help"])).toBe("node --version --help");
    });

    it("should handle empty additional args", () => {
      const runner = new TestRunner();
      expect(runner.rawFullCommand([])).toBe("node --version");
    });

    it("should handle multiple additional args", () => {
      const runner = new TestRunner();
      expect(runner.rawFullCommand(["run", "script.js"])).toBe("node --version run script.js");
    });
  });
});
