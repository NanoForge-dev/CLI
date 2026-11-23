import { type Input, getDirectoryInput, getEditorInput } from "@lib/input";
import { RunnerFactory } from "@lib/runner";
import { Messages } from "@lib/ui";

import { getCwd } from "@utils/path";

import { AbstractAction, type HandleResult } from "../abstract.action";

export class DevAction extends AbstractAction {
  protected startMessage = Messages.DEV_START;
  protected successMessage = Messages.DEV_SUCCESS;
  protected failureMessage = Messages.DEV_FAILED;

  public async handle(_args: Input, options: Input): Promise<HandleResult> {
    const directory = getDirectoryInput(options);

    const editor = getEditorInput(options);
    const tasks = this.buildTaskList(directory, editor);
    return this.waitForChildren(tasks);
  }

  private buildTaskList(directory: string, editor: boolean): Promise<boolean>[] {
    const tasks: Promise<boolean>[] = [];
    const extraFlags = editor ? ["--editor"] : [];

    tasks.push(this.runSubCommand("build", directory, extraFlags));
    tasks.push(this.runSubCommand("start", directory));

    return tasks;
  }

  private async runSubCommand(
    command: string,
    directory: string,
    extraFlags: string[] = [],
  ): Promise<boolean> {
    // This same CLI, never `<pm> exec nf`: npm can fetch the unrelated public `nf` package (#287).
    // In the project folder, nf.ts picks the project's local CLI as it did for this process.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- argv[1] is the script node runs
    const self = RunnerFactory.create(process.execPath, [process.argv[1]!]);
    // Not collected: `build --watch` never exits, so collected output (errors included)
    // would never show.
    await self.run([command, "--watch", ...extraFlags], { cwd: getCwd(directory) });
    return true;
  }
}
