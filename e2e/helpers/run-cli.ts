import { type SpawnOptions, spawn } from "node:child_process";
import { resolve } from "node:path";

const CLI_PATH = resolve(__dirname, "../../dist/nf.js");

interface CliResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

export const runCli = (args: string[], options?: SpawnOptions): Promise<CliResult> => {
  return new Promise((resolve) => {
    const child = spawn("node", [CLI_PATH, ...args], {
      stdio: "pipe",
      ...options,
    });

    const stdout: string[] = [];
    const stderr: string[] = [];

    child.stdout?.on("data", (data) => stdout.push(data.toString()));
    child.stderr?.on("data", (data) => stderr.push(data.toString()));

    child.on("close", (code) => {
      resolve({
        stdout: stdout.join(""),
        stderr: stderr.join(""),
        exitCode: code,
      });
    });
  });
};
