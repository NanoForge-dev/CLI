import { type Command } from "commander";

import { AbstractCommand } from "../abstract.command";

interface InstallOptions {
  directory?: string;
}

export class InstallCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("install [names...]")
      .alias("add")
      .description("add NanoForge library to your project")
      .option("-d, --directory [directory]", "specify the directory of your project")
      .action(async (names: string[], rawOptions: InstallOptions) => {
        const options = AbstractCommand.mapToInput({
          directory: rawOptions.directory,
        });
        const args = AbstractCommand.mapToInput({
          names: names.length ? names : undefined,
        });

        await this.action.run(args, options);
      });
  }
}
