import { red } from "ansis";
import { Command } from "commander";

import { BuildAction } from "../action/actions/build.action";
import { InstallAction } from "../action/actions/install.action";
import { Prefixes } from "../lib/ui";
import { BuildCommand } from "./commands/build.command";
import { InstallCommand } from "./commands/install.command";

export class CommandLoader {
  public static async load(program: Command): Promise<void> {
    new InstallCommand(new InstallAction()).load(program);
    new BuildCommand(new BuildAction()).load(program);
    this.handleInvalidCommand(program);
  }

  private static handleInvalidCommand(program: Command) {
    program.on("command:*", () => {
      console.error(
        `\n${Prefixes.ERROR} Invalid command: ${red`%s`}`,
        program.args.join(" "),
      );
      console.log(`See ${red`--help`} for a list of available commands.\n`);
      process.exit(1);
    });
  }
}
