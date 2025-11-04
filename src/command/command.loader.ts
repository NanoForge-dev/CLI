import { red } from "ansis";
import { Command } from "commander";

import { ERROR_PREFIX } from "../lib/ui";

export class CommandLoader {
  public static async load(program: Command): Promise<void> {
    this.handleInvalidCommand(program);
  }

  private static handleInvalidCommand(program: Command) {
    program.on("command:*", () => {
      console.error(
        `\n${ERROR_PREFIX} Invalid command: ${red`%s`}`,
        program.args.join(" "),
      );
      console.log(`See ${red`--help`} for a list of available commands.\n`);
      process.exit(1);
    });
  }
}
