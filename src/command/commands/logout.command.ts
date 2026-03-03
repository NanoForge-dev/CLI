import { type Command } from "commander";

import { AbstractCommand } from "../abstract.command";

interface LogoutOptions {
  directory?: string;
  local?: boolean;
}

export class LogoutCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("logout")
      .description("logout from Nanoforge registry")
      .option("-d, --directory [directory]", "specify the directory of your project")
      .option("-l, --local", "logout only for the project")
      .action(async (rawOptions: LogoutOptions) => {
        const options = AbstractCommand.mapToInput({
          directory: rawOptions.directory,
          local: rawOptions.local,
        });

        await this.action.run(new Map(), options);
      });
  }
}
