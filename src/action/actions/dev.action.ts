import { type Input, getDevGenerateInput, getDirectoryInput } from "@lib/input";
import { PackageManagerFactory } from "@lib/package-manager";
import { Messages } from "@lib/ui";

import { runSafe } from "@utils/run-safe";

import { AbstractAction, type HandleResult } from "../abstract.action";

export class DevAction extends AbstractAction {
  protected startMessage = Messages.DEV_START;
  protected successMessage = Messages.DEV_SUCCESS;
  protected failureMessage = Messages.DEV_FAILED;

  public async handle(_args: Input, options: Input): Promise<HandleResult> {
    const directory = getDirectoryInput(options);
    const generate = getDevGenerateInput(options);

    const tasks = this.buildTaskList(directory, generate);
    await Promise.all(tasks);

    return { keepAlive: true };
  }

  private buildTaskList(directory: string, generate: boolean): Promise<void>[] {
    const tasks: Promise<void>[] = [];

    if (generate) {
      tasks.push(this.runSubCommand("generate", directory, { silent: true }));
    }

    tasks.push(this.runSubCommand("build", directory, { silent: true }));
    tasks.push(this.runSubCommand("start", directory, { silent: false }));

    return tasks;
  }

  private async runSubCommand(
    command: string,
    directory: string,
    options: { silent: boolean },
  ): Promise<void> {
    await runSafe(async () => {
      const packageManager = await PackageManagerFactory.find(directory);
      await packageManager.runDev(directory, "nf", {}, [command, "--watch"], options.silent);
    });
  }
}
