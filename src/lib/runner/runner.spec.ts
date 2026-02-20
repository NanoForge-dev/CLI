import { describe, expect, it } from "vitest";

import { Runner } from "./runner";

describe("Runner", () => {
  describe("fullCommand", () => {
    it("should combine binary, base args, and additional args", () => {
      const runner = new Runner("node", ["--version"]);
      expect(runner.fullCommand(["--help"])).toBe("node --version --help");
    });

    it("should handle empty additional args", () => {
      const runner = new Runner("node", ["--version"]);
      expect(runner.fullCommand([])).toBe("node --version");
    });

    it("should handle multiple additional args", () => {
      const runner = new Runner("node", ["--version"]);
      expect(runner.fullCommand(["run", "script.js"])).toBe("node --version run script.js");
    });

    it("should handle runner with no base args", () => {
      const runner = new Runner("bun");
      expect(runner.fullCommand(["install"])).toBe("bun install");
    });
  });
});
