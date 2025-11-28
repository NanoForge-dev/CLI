import { red } from "ansis";
import { ChildProcess, SpawnOptions, spawn } from "child_process";
import * as process from "node:process";

import { Messages } from "@lib/ui";

interface RunnerListeners {
  onStdout?: (chunk: any) => void;
  onStderr?: (chunk: any) => void;
}

export class AbstractRunner {
  constructor(
    protected binary: string,
    protected args: string[] = [],
  ) {}

  public async run(
    args: string[],
    collect = false,
    cwd: string = process.cwd(),
    env?: Record<string, string>,
    listeners?: RunnerListeners,
    failSpinner?: () => void,
  ): Promise<null | string> {
    const options: SpawnOptions = {
      cwd,
      stdio: collect ? "pipe" : "inherit",
      shell: true,
      env: { ...process.env, ...env },
    };
    return new Promise<null | string>((resolve, reject) => {
      const child: ChildProcess = spawn(
        `${this.binary} ${[...this.args, ...args].join(" ")}`,
        options,
      );

      const res: string[] = [];
      child.stdout?.on(
        "data",
        listeners?.onStdout ?? ((data) => res.push(data.toString().replace(/\r\n|\n/, ""))),
      );
      child.stderr?.on(
        "data",
        listeners?.onStderr ?? ((data) => res.push(data.toString().replace(/\r\n|\n/, ""))),
      );

      child.on("close", (code) => {
        if (code === 0) {
          resolve(collect && res.length ? res.join("\n") : null);
        } else {
          if (failSpinner) failSpinner();
          console.error(
            red(Messages.RUNNER_EXECUTION_ERROR([this.binary, ...this.args, ...args].join(" "))),
          );
          if (res.length) {
            console.error();
            console.error(res.join("\n"));
            console.error();
          }
          reject();
        }
      });
    });
  }

  public rawFullCommand(args: string[]): string {
    const commandArgs: string[] = [...this.args, ...args];
    return `${this.binary} ${commandArgs.join(" ")}`;
  }
}
