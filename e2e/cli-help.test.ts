import { describe, expect, it } from "vitest";

import { runCli } from "./helpers/run-cli";

describe("nf --help", () => {
  it("should display help with all commands", async () => {
    const { stdout, exitCode } = await runCli(["--help"]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("Usage: nf <command> [options]");
    expect(stdout).toContain("build");
    expect(stdout).toContain("dev");
    expect(stdout).toContain("generate");
    expect(stdout).toContain("install|add");
    expect(stdout).toContain("new");
    expect(stdout).toContain("start");
  });

  it("should display version", async () => {
    const { stdout, exitCode } = await runCli(["--version"]);

    expect(exitCode).toBe(0);
    expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("should exit with 1 on invalid command", async () => {
    const { exitCode, stderr } = await runCli(["invalid-command"]);

    expect(exitCode).toBe(1);
    expect(stderr).toContain("Invalid command");
  });
});

describe("nf new --help", () => {
  it("should display new command options", async () => {
    const { stdout, exitCode } = await runCli(["new", "--help"]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("create a new nanoforge project");
    expect(stdout).toContain("--name");
    expect(stdout).toContain("--language");
    expect(stdout).toContain("--package-manager");
    expect(stdout).toContain("--strict");
    expect(stdout).toContain("--server");
    expect(stdout).toContain("--init-functions");
    expect(stdout).toContain("--skip-install");
    expect(stdout).toContain("--directory");
    expect(stdout).toContain("--docker");
  });
});

describe("nf build --help", () => {
  it("should display build command options", async () => {
    const { stdout, exitCode } = await runCli(["build", "--help"]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("build your game");
    expect(stdout).toContain("--directory");
    expect(stdout).toContain("--config");
    expect(stdout).toContain("--client-outDir");
    expect(stdout).toContain("--server-outDir");
    expect(stdout).toContain("--watch");
  });
});

describe("nf generate --help", () => {
  it("should display generate command options", async () => {
    const { stdout, exitCode } = await runCli(["generate", "--help"]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("generate nanoforge files from config");
    expect(stdout).toContain("--directory");
    expect(stdout).toContain("--config");
    expect(stdout).toContain("--watch");
  });
});

describe("nf install --help", () => {
  it("should display install command options", async () => {
    const { stdout, exitCode } = await runCli(["install", "--help"]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("add Nanoforge components and systems to your project");
    expect(stdout).toContain("--directory");
    expect(stdout).toContain("--lib");
    expect(stdout).toContain("--server");
  });
});

describe("nf start --help", () => {
  it("should display start command options", async () => {
    const { stdout, exitCode } = await runCli(["start", "--help"]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("start your game");
    expect(stdout).toContain("--directory");
    expect(stdout).toContain("--config");
    expect(stdout).toContain("--port");
    expect(stdout).toContain("--watch");
  });
});

describe("nf dev --help", () => {
  it("should display dev command options", async () => {
    const { stdout, exitCode } = await runCli(["dev", "--help"]);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("run your game in dev mode");
    expect(stdout).toContain("--directory");
    expect(stdout).toContain("--generate");
  });
});
