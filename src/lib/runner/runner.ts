import { red } from "ansis";
import { type ChildProcess, type SpawnOptions, spawn } from "child_process";
import * as process from "node:process";

const IS_WINDOWS = process.platform === "win32";

/**
 * Quotes one argument for cmd.exe: npm, pnpm and yarn are `.cmd` shims there, which Node only starts
 * through a shell. Elsewhere, arguments go to the binary as an array, with no shell. cmd.exe has no
 * escape for `"` and expands `%VAR%` inside quotes, so arguments holding them are refused.
 * shortcut: refuses `"`, `%` and line breaks on Windows, use cross-spawn if real arguments need them.
 */
export const quoteForCmd = (arg: string): string => {
  if (/["%\r\n]/.test(arg))
    throw new Error(
      `error: argument not supported on Windows (holds ", % or a line break): ${arg}`,
    );
  // A trailing backslash would escape the closing quote.
  return `"${arg.replace(/(\\+)$/, "$1$1")}"`;
};

export interface RunOptions {
  collect?: boolean;
  cwd?: string;
  env?: Record<string, string>;
  listeners?: RunnerListeners;
  onFail?: () => void;
}

export interface RunnerListeners {
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
}

export class Runner {
  constructor(
    private readonly binary: string,
    private readonly baseArgs: string[] = [],
  ) {}

  public async run(args: string[], options: RunOptions = {}): Promise<string | null> {
    const { collect = false, cwd = process.cwd(), env, listeners, onFail } = options;
    const spawnOpts = this.buildSpawnOptions(collect, cwd, env);
    const fullArgs = [...this.baseArgs, ...args].filter((arg) => arg !== "");

    return new Promise<string | null>((resolve, reject) => {
      const child = IS_WINDOWS
        ? spawn([this.binary, ...fullArgs].map(quoteForCmd).join(" "), spawnOpts)
        : spawn(this.binary, fullArgs, spawnOpts);
      const output = this.attachOutputHandlers(child, listeners);

      child.on("error", (error) => {
        this.handleFailure(output, fullArgs, onFail);
        reject(error);
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve(this.formatOutput(output, collect));
        } else {
          this.handleFailure(output, fullArgs, onFail);
          reject(this.createError(fullArgs, code));
        }
      });
    });
  }

  public fullCommand(args: string[]): string {
    return [this.binary, ...this.baseArgs, ...args].join(" ");
  }

  private buildSpawnOptions(
    collect: boolean,
    cwd: string,
    env?: Record<string, string>,
  ): SpawnOptions {
    return {
      cwd,
      stdio: collect ? "pipe" : "inherit",
      shell: IS_WINDOWS,
      env: { ...process.env, ...env },
    };
  }

  private attachOutputHandlers(child: ChildProcess, listeners?: RunnerListeners): string[] {
    const output: string[] = [];
    const defaultHandler = (data: Buffer) => output.push(data.toString().replace(/\r\n|\n/, ""));

    child.stdout?.on("data", listeners?.onStdout ?? defaultHandler);
    child.stderr?.on("data", listeners?.onStderr ?? defaultHandler);

    return output;
  }

  private formatOutput(output: string[], collect: boolean): string | null {
    return collect && output.length ? output.join("\n") : null;
  }

  private handleFailure(output: string[], args: string[], onFail?: () => void): void {
    if (onFail) onFail();
    this.logFailedCommand(args);
    this.logCapturedOutput(output);
  }

  private logFailedCommand(args: string[]): void {
    console.error(red(`\nFailed to execute command: ${this.binary} ${args.join(" ")}`));
  }

  private logCapturedOutput(output: string[]): void {
    if (output.length) {
      console.error();
      console.error(output.join("\n"));
      console.error();
    }
  }

  private createError(args: string[], code: number | null): Error {
    return new Error(`Command "${this.binary} ${args.join(" ")}" exited with code ${code}`);
  }
}
