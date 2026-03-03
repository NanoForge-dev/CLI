import { type Command } from "commander";

import { AbstractCommand } from "../abstract.command";

interface LoginOptions {
  directory?: string;
  local?: boolean;
  apiKey?: string;
}

export class LoginCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("login")
      .description("login to Nanoforge registry")
      .option("-d, --directory [directory]", "specify the directory of your project")
      .option("-l, --local", "login only for the project", false)
      .option("-k, --api-key <key>", "api key for Nanoforge registry")
      .action(async (rawOptions: LoginOptions) => {
        const options = AbstractCommand.mapToInput({
          directory: rawOptions.directory,
          local: rawOptions.local,
          apiKey: rawOptions.apiKey,
        });

        await this.action.run(new Map(), options);
      });
  }
}
