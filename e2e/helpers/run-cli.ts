import { type SpawnOptions, spawn } from "node:child_process";
import { resolve } from "node:path";

const CLI_PATH = resolve(__dirname, "../../dist/nf.js");

interface CliResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  killed: boolean;
}

interface RunCliOptions extends SpawnOptions {
  timeout?: number;
}

export const runCli = (args: string[], options?: RunCliOptions): Promise<CliResult> => {
  return new Promise((resolve) => {
    const { timeout, ...spawnOptions } = options ?? {};

    const child = spawn("node", [CLI_PATH, ...args], {
      stdio: "pipe",
      ...spawnOptions,
    });

    let killed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (timeout) {
      timer = setTimeout(() => {
        killed = true;
        child.kill("SIGTERM");
      }, timeout);
    }

    const stdout: string[] = [];
    const stderr: string[] = [];

    child.stdout?.on("data", (data) => stdout.push(data.toString()));
    child.stderr?.on("data", (data) => stderr.push(data.toString()));

    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      resolve({
        stdout: stdout.join(""),
        stderr: stderr.join(""),
        exitCode: code,
        killed,
      });
    });
  });
};
