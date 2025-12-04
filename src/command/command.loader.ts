import { red } from "ansis";
import { Command } from "commander";

import { Prefixes } from "@lib/ui";

import { BuildAction, GenerateAction, InstallAction, NewAction, StartAction } from "~/action";

import { BuildCommand } from "./commands/build.command";
import { GenerateCommand } from "./commands/generate.command";
import { InstallCommand } from "./commands/install.command";
import { NewCommand } from "./commands/new.command";
import { StartCommand } from "./commands/start.command";

export class CommandLoader {
  public static async load(program: Command): Promise<void> {
    new BuildCommand(new BuildAction()).load(program);
    new GenerateCommand(new GenerateAction()).load(program);
    new InstallCommand(new InstallAction()).load(program);
    new NewCommand(new NewAction()).load(program);
    new StartCommand(new StartAction()).load(program);
    this.handleInvalidCommand(program);
  }

  private static handleInvalidCommand(program: Command) {
    program.on("command:*", () => {
      console.error(`\n${Prefixes.ERROR} Invalid command: ${red`%s`}`, program.args.join(" "));
      console.log(`See ${red`--help`} for a list of available commands.\n`);
      process.exit(1);
    });
  }
}
