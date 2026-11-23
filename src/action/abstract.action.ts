import { red } from "ansis";

import { type Input } from "@lib/input";
import { treeKill } from "@lib/tree-kill";
import { Prefixes } from "@lib/ui";

import { getErrorMessage, handleActionError } from "@utils/errors";

const STOP_SIGNALS: NodeJS.Signals[] = ["SIGINT", "SIGTERM", "SIGHUP", "SIGQUIT", "SIGBREAK"];

export interface HandleResult {
  success?: boolean;
  keepAlive?: boolean;
  error?: unknown;
}

export abstract class AbstractAction {
  protected abstract startMessage: string;
  protected abstract successMessage: string;
  protected abstract failureMessage: string;
  /** Printed when a child fails; empty when the child's own failure line says the same. */
  protected childFailureMessage?: string;

  private stopping = false;

  public abstract handle(
    args?: Input,
    options?: Input,
    extraFlags?: string[],
  ): Promise<HandleResult>;

  public async run(args?: Input, options?: Input, extraFlags?: string[]): Promise<void> {
    this.logStart();

    try {
      const result = await this.handle(args, options, extraFlags);
      await this.resolveResult(result);
    } catch (error: unknown) {
      handleActionError(this.failureMessage, error);
    }
  }

  /**
   * Keeps the command alive while the processes it started run. The first one that fails (resolves
   * `false` or rejects) fails the command: the others are stopped and the CLI exits 1.
   */
  protected waitForChildren(tasks: Promise<boolean>[]): Promise<HandleResult> {
    // Ctrl+C stops the children too: nf.ts kills the tree then, it is not a failure.
    for (const signal of STOP_SIGNALS) process.once(signal, () => (this.stopping = true));

    return new Promise((resolve) => {
      const fail = (error?: unknown) => resolve({ keepAlive: true, success: false, error });
      for (const task of tasks) void task.then((ok) => (ok ? undefined : fail()), fail);
      void Promise.allSettled(tasks).then(() => resolve({ keepAlive: true }));
    });
  }

  private logStart(): void {
    console.info();
    console.info(`${Prefixes.INFO} ${this.startMessage}`);
    console.info();
  }

  private async resolveResult(result: HandleResult): Promise<void> {
    const success = result?.success !== false;
    const keepAlive = result?.keepAlive === true;

    if (keepAlive && success) return;
    if (keepAlive) return this.stopChildren(result.error);

    console.info();

    if (!success) {
      handleActionError(this.failureMessage, result.error);
      process.exit(1);
    }

    if (this.successMessage) console.info(this.successMessage);
    process.exit(0);
  }

  private async stopChildren(error: unknown): Promise<void> {
    if (this.stopping) return;

    // Printed first: on Windows, taskkill /T /F ends this process too.
    console.error();
    const header = this.childFailureMessage ?? this.failureMessage;
    if (header) console.error(red(header));
    const message = getErrorMessage(error);
    if (message) console.error(message);

    // shortcut: kills the CLI's whole process tree (itself last, exit 1 runs first), as the runner
    // exposes no child to kill; kill only the children once the runner hands them out.
    await treeKill(process.pid, "SIGTERM");
    process.exit(1);
  }
}
