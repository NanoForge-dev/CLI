import { type Command } from "commander";

import { AbstractCommand } from "../abstract.command";

interface InstallOptions {
  directory?: string;
  lib?: boolean;
}

export class InstallCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("install [names...]")
      .alias("add")
      .description("add NanoForge registry packages to your project")
      .option("-d, --directory <directory>", "specify the working directory of the command")
      .option("-l, --lib", "install npm libraries with the package manager instead", false)
      .action(async (names: string[], rawOptions: InstallOptions) => {
        const options = AbstractCommand.mapToInput({
          directory: rawOptions.directory,
          lib: rawOptions.lib,
        });
        const args = AbstractCommand.mapToInput({
          names: names.length ? names : undefined,
        });

        await this.action.run(args, options);
      });
  }
}
