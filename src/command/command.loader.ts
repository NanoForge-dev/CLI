import { red } from "ansis";
import { type Command } from "commander";

import { Prefixes } from "@lib/ui";

import {
  BuildAction,
  CreateAction,
  DevAction,
  EditorAction,
  GenerateAction,
  InstallAction,
  LoginAction,
  LogoutAction,
  NewAction,
  PublishAction,
  StartAction,
  UnpublishAction,
} from "~/action";

import { BuildCommand } from "./commands/build.command";
import { CreateCommand } from "./commands/create.command";
import { DevCommand } from "./commands/dev.command";
import { EditorCommand } from "./commands/editor.command";
import { GenerateCommand } from "./commands/generate.command";
import { InstallCommand } from "./commands/install.command";
import { LoginCommand } from "./commands/login.command";
import { LogoutCommand } from "./commands/logout.command";
import { NewCommand } from "./commands/new.command";
import { PublishCommand } from "./commands/publish.command";
import { StartCommand } from "./commands/start.command";
import { UnpublishCommand } from "./commands/unpublish.command";

export class CommandLoader {
  public static async load(program: Command): Promise<void> {
    new NewCommand(new NewAction()).load(program);
    new InstallCommand(new InstallAction()).load(program);
    new BuildCommand(new BuildAction()).load(program);
    new StartCommand(new StartAction()).load(program);
    new DevCommand(new DevAction()).load(program);
    new EditorCommand(new EditorAction()).load(program);
    new GenerateCommand(new GenerateAction()).load(program);
    new CreateCommand(new CreateAction()).load(program);
    new LoginCommand(new LoginAction()).load(program);
    new LogoutCommand(new LogoutAction()).load(program);
    new PublishCommand(new PublishAction()).load(program);
    new UnpublishCommand(new UnpublishAction()).load(program);
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
