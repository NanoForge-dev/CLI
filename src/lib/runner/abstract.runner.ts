import { red } from "ansis";
import { ChildProcess, SpawnOptions, spawn } from "child_process";

import { Messages } from "../ui";

export class AbstractRunner {
  constructor(
    protected binary: string,
    protected args: string[] = [],
  ) {}

  public async run(
    command: string,
    collect = false,
    cwd: string = process.cwd(),
  ): Promise<null | string> {
    const args: string[] = [command];
    const options: SpawnOptions = {
      cwd,
      stdio: collect ? "pipe" : "inherit",
      shell: true,
    };
    return new Promise<null | string>((resolve, reject) => {
      const child: ChildProcess = spawn(
        `${this.binary}`,
        [...this.args, ...args],
        options,
      );

      const res: string[] = [];
      child.stdout?.on("data", (data) =>
        res.push(data.toString().replace(/\r\n|\n/, "")),
      );
      child.stderr?.on("data", (data) =>
        res.push(data.toString().replace(/\r\n|\n/, "")),
      );

      child.on("close", (code) => {
        if (code === 0) {
          resolve(collect && res.length ? res.join("\n") : null);
        } else {
          console.error(
            red(Messages.RUNNER_EXECUTION_ERROR(`${this.binary} ${command}`)),
          );
          console.error();
          console.error(res.join("\n"));
          console.error();
          reject();
        }
      });
    });
  }

  public rawFullCommand(command: string): string {
    const commandArgs: string[] = [...this.args, command];
    return `${this.binary} ${commandArgs.join(" ")}`;
  }
}
