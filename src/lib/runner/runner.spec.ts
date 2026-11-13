import { describe, expect, it } from "vitest";

import { Runner, cmdLine, quoteForCmd } from "./runner";

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

  describe.skipIf(process.platform === "win32")("run", () => {
    const echo = new Runner("node", ["-e", "process.stdout.write(process.argv[1])"]);

    it("should pass shell syntax as plain text", async () => {
      const arg = 'a"; $(echo pwned) `id` && echo pwned';
      expect(await echo.run([arg], { collect: true })).toBe(arg);
    });

    it("should keep an argument with spaces whole", async () => {
      expect(await echo.run(["my project/dir"], { collect: true })).toBe("my project/dir");
    });

    it("should reject when the binary is missing", async () => {
      await expect(new Runner("nf-missing-binary").run([], { collect: true })).rejects.toThrow();
    });
  });

  describe("quoteForCmd", () => {
    it("should wrap an argument in double quotes", () => {
      expect(quoteForCmd("a & b")).toBe('"a & b"');
    });

    it("should double a trailing backslash", () => {
      expect(quoteForCmd("C:\\dir\\")).toBe('"C:\\dir\\\\"');
    });

    it("should refuse what cmd.exe can't quote", () => {
      expect(() => quoteForCmd('a" & calc')).toThrow(/error/);
      expect(() => quoteForCmd("%PATH%")).toThrow(/error/);
      expect(() => quoteForCmd("!PATH!")).toThrow(/error/);
    });
  });

  describe("cmdLine", () => {
    it("should leave a bare binary name unquoted", () => {
      expect(cmdLine("npm", ["install", "a b"])).toBe('npm "install" "a b"');
    });

    it("should quote a binary path", () => {
      expect(cmdLine("C:\\Program Files\\nf\\bun.cmd", ["x"])).toBe(
        '"C:\\Program Files\\nf\\bun.cmd" "x"',
      );
    });

    it("should refuse a binary path cmd.exe can't quote", () => {
      expect(() => cmdLine("C:\\%PATH%\\npm", [])).toThrow(/error/);
    });
  });
});
