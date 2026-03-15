import { type Command } from "commander";

import { AbstractCommand } from "../abstract.command";

interface PublishOptions {
  directory?: string;
}

export class PublishCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("publish")
      .description("publish package to Nanoforge registry")
      .option("-d, --directory [directory]", "specify the working directory of the command")
      .action(async (rawOptions: PublishOptions) => {
        const options = AbstractCommand.mapToInput({
          directory: rawOptions.directory,
        });

        await this.action.run(new Map(), options);
      });
  }
}
