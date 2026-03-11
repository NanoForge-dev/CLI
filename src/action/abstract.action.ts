import { type Input } from "@lib/input";
import { Prefixes } from "@lib/ui";

import { handleActionError } from "@utils/errors";

export interface HandleResult {
  success?: boolean;
  keepAlive?: boolean;
  error?: unknown;
}

export abstract class AbstractAction {
  protected abstract startMessage: string;
  protected abstract successMessage: string;
  protected abstract failureMessage: string;

  public abstract handle(
    args?: Input,
    options?: Input,
    extraFlags?: string[],
  ): Promise<HandleResult>;

  public async run(args?: Input, options?: Input, extraFlags?: string[]): Promise<void> {
    this.logStart();

    try {
      const result = await this.handle(args, options, extraFlags);
      this.resolveResult(result);
    } catch (error: unknown) {
      handleActionError(this.failureMessage, error);
    }
  }

  private logStart(): void {
    console.info();
    console.info(`${Prefixes.INFO} ${this.startMessage}`);
    console.info();
  }

  private resolveResult(result: HandleResult): void {
    const success = result?.success !== false;
    const keepAlive = result?.keepAlive === true;

    if (keepAlive) return;

    console.info();

    if (!success) {
      handleActionError(this.failureMessage, result.error);
      process.exit(1);
    }

    if (this.successMessage) console.info(this.successMessage);
    process.exit(0);
  }
}
