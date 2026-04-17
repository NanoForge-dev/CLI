import { type Command } from "commander";

import { AbstractCommand } from "../abstract.command";

interface UnpublishOptions {
  directory?: string;
}

export class UnpublishCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("unpublish")
      .description("unpublish package to Nanoforge registry")
      .option("-d, --directory <directory>", "specify the working directory of the command")
      .action(async (rawOptions: UnpublishOptions) => {
        const options = AbstractCommand.mapToInput({
          directory: rawOptions.directory,
        });

        await this.action.run(new Map(), options);
      });
  }
}
