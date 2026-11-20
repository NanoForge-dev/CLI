import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type Runner } from "@lib/runner/runner";

import { CLIError } from "@utils/errors";

import { PackageManager } from "./package-manager";
import { PM_CONFIGS } from "./package-manager-configs";
import { PackageManagerName } from "./package-manager-name";

type RunnerStub = {
  run: ReturnType<typeof vi.fn>;
  fullCommand: ReturnType<typeof vi.fn>;
};

const makePackageManager = (name: PackageManagerName, runner: RunnerStub): PackageManager =>
  new PackageManager(name, PM_CONFIGS[name].commands, runner as unknown as Runner);

const lastRunArgs = (runner: RunnerStub): string[] => runner.run.mock.calls.at(-1)?.[0] as string[];

const lastRunCwd = (runner: RunnerStub): string | undefined =>
  (runner.run.mock.calls.at(-1)?.[1] as { cwd?: string } | undefined)?.cwd;

describe("PackageManager", () => {
  let runner: RunnerStub;

  beforeEach(() => {
    runner = {
      run: vi.fn().mockResolvedValue(""),
      fullCommand: vi.fn((args: string[]) => args.join(" ")),
    };
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  describe("install", () => {
    it("should run the install command with the silent flag in the given directory", async () => {
      const pm = makePackageManager(PackageManagerName.BUN, runner);

      await expect(pm.install("/project")).resolves.toBe(true);
      expect(lastRunArgs(runner)).toEqual(["install", "--silent"]);
      expect(lastRunCwd(runner)).toBe(resolve("/project"));
    });

    it("should return false when the runner fails", async () => {
      runner.run.mockRejectedValue(new Error("boom"));
      const pm = makePackageManager(PackageManagerName.BUN, runner);

      await expect(pm.install("/project")).resolves.toBe(false);
    });
  });

  describe("addProduction / addDevelopment", () => {
    it("should add production dependencies with the manager's save flag", async () => {
      const pm = makePackageManager(PackageManagerName.BUN, runner);

      await expect(pm.addProduction("/project", ["react", "react-dom"])).resolves.toBe(true);
      expect(lastRunArgs(runner)).toEqual(["add", "--save", "react", "react-dom"]);
    });

    it("should add development dependencies with the manager's dev flag", async () => {
      const bun = makePackageManager(PackageManagerName.BUN, runner);
      await bun.addDevelopment("/project", ["vitest"]);
      expect(lastRunArgs(runner)).toEqual(["add", "--dev", "vitest"]);

      const npm = makePackageManager(PackageManagerName.NPM, runner);
      await npm.addDevelopment("/project", ["vitest"]);
      expect(lastRunArgs(runner)).toEqual(["install", "--save-dev", "vitest"]);
    });

    it("should succeed without running anything when there are no dependencies", async () => {
      const pm = makePackageManager(PackageManagerName.BUN, runner);

      await expect(pm.addProduction("/project", [])).resolves.toBe(true);
      expect(runner.run).not.toHaveBeenCalled();
    });
  });

  describe("build", () => {
    it("should throw a CLIError for a manager without a build command", async () => {
      const pm = makePackageManager(PackageManagerName.BUN, runner);

      await expect(pm.build("Client", "/project", "src/index.ts", "dist")).rejects.toThrow(
        CLIError,
      );
      await expect(pm.build("Client", "/project", "src/index.ts", "dist")).rejects.toThrow(
        'does not support "build"',
      );
      expect(runner.run).not.toHaveBeenCalled();
    });

    it("should assemble the build arguments for the local bun manager", async () => {
      const pm = makePackageManager(PackageManagerName.LOCAL_BUN, runner);

      await expect(
        pm.build("Client", "/project", "src/index.ts", "dist", ["--target", "browser"]),
      ).resolves.toBe(true);
      expect(lastRunArgs(runner)).toEqual([
        "build",
        "--silent",
        "src/index.ts",
        "--outdir",
        "dist",
        "--target",
        "browser",
      ]);
    });
  });

  describe("run", () => {
    it("should insert the run-args flag before the params for npm", async () => {
      const pm = makePackageManager(PackageManagerName.NPM, runner);

      await expect(pm.run("Server", "/project", "start", ["-p", "3000"])).resolves.toBe(true);
      expect(lastRunArgs(runner)).toEqual(["run", "start", "--", "-p", "3000"]);
    });

    it("should not add a run-args flag for bun, and should add the silent flag when asked", async () => {
      const pm = makePackageManager(PackageManagerName.BUN, runner);

      await pm.run("Server", "/project", "start", ["-p", "3000"], {}, [], true);
      expect(lastRunArgs(runner)).toEqual(["run", "--silent", "start", "-p", "3000"]);
    });

    it("should omit the params separator when there are no params", async () => {
      const pm = makePackageManager(PackageManagerName.NPM, runner);

      await pm.run("Server", "/project", "start", []);
      expect(lastRunArgs(runner)).toEqual(["run", "start"]);
    });

    it("should return false when the runner fails", async () => {
      runner.run.mockRejectedValue(new Error("boom"));
      const pm = makePackageManager(PackageManagerName.BUN, runner);

      await expect(pm.run("Server", "/project", "start", [])).resolves.toBe(false);
    });
  });

  describe("runFile", () => {
    it("should return false for a manager without a runFile command", async () => {
      const pm = makePackageManager(PackageManagerName.BUN, runner);

      await expect(pm.runFile("Server", "/project", "server.ts", [])).resolves.toBe(false);
      expect(runner.run).not.toHaveBeenCalled();
    });

    it("should run the file with the local bun manager", async () => {
      const pm = makePackageManager(PackageManagerName.LOCAL_BUN, runner);

      await expect(pm.runFile("Server", "/project", "server.ts", ["--watch"])).resolves.toBe(true);
      expect(lastRunArgs(runner)).toEqual(["run", "server.ts", "--watch"]);
    });
  });

  describe("runDev", () => {
    it("should exec the command, with the run-args flag only for managers that define one", async () => {
      const npm = makePackageManager(PackageManagerName.NPM, runner);
      await npm.runDev("/project", "vite", {}, ["--port", "5173"]);
      expect(lastRunArgs(runner)).toEqual(["exec", "vite", "--", "--port", "5173"]);

      const bun = makePackageManager(PackageManagerName.BUN, runner);
      await bun.runDev("/project", "vite", {}, ["--port", "5173"]);
      expect(lastRunArgs(runner)).toEqual(["exec", "vite", "--port", "5173"]);
    });

    it("should return false when the runner fails", async () => {
      runner.run.mockRejectedValue(new Error("boom"));
      const pm = makePackageManager(PackageManagerName.BUN, runner);

      await expect(pm.runDev("/project", "vite")).resolves.toBe(false);
    });
  });
});
