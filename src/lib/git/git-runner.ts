import { type RunOptions, Runner } from "@lib/runner/runner";
import { Messages } from "@lib/ui";

import { getCwd } from "@utils/path";
import { withSpinner } from "@utils/spinner";

const GIT = "git";
const GIT_COMMANDS = {
  init: "init",
  remote: "remote",
};

export class GitRunner {
  private readonly runner: Runner;

  constructor() {
    this.runner = new Runner(GIT);
  }

  public async init(directory: string): Promise<boolean> {
    const args = [GIT_COMMANDS.init];

    const result = await withSpinner(
      () => this.exec(args, directory),
      Messages.GIT_INIT_IN_PROGRESS,
      Messages.GIT_INIT_SUCCEED,
      Messages.GIT_INIT_FAILED(this.formatFailCommand(args)),
    );

    return result.success;
  }

  public async addRemote(directory: string, remote: string): Promise<boolean> {
    const args = [GIT_COMMANDS.remote, "add", "origin", remote];

    const result = await withSpinner(
      () => this.exec(args, directory),
      Messages.GIT_REMOTE_IN_PROGRESS,
      Messages.GIT_REMOTE_SUCCEED,
      Messages.GIT_REMOTE_FAILED(this.formatFailCommand(args)),
    );

    return result.success;
  }

  private exec(
    args: string[],
    directory: string,
    options: {
      collect?: boolean;
      env?: Record<string, string>;
      listeners?: RunOptions["listeners"];
      onFail?: () => void;
    } = {},
  ): Promise<string | null> {
    return this.runner.run(args, {
      collect: options.collect ?? true,
      cwd: getCwd(directory),
      env: options.env,
      listeners: options.listeners,
      onFail: options.onFail,
    });
  }

  private formatFailCommand(args: string[]): string {
    return this.runner.fullCommand(args);
  }
}
