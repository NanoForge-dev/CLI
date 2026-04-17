import { type Command } from "commander";

import { AbstractCommand } from "../abstract.command";

interface InstallOptions {
  directory?: string;
  lib?: boolean;
  server?: boolean;
}

export class InstallCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("install [names...]")
      .alias("add")
      .description("add Nanoforge components and systems to your project")
      .option("-d, --directory <directory>", "specify the working directory of the command")
      .option("-l, --lib", "install library instead of component/system", false)
      .option(
        "-s, --server",
        "install components/systems on server (default install on client)",
        false,
      )
      .action(async (names: string[], rawOptions: InstallOptions) => {
        const options = AbstractCommand.mapToInput({
          directory: rawOptions.directory,
          lib: rawOptions.lib,
          server: rawOptions.server,
        });
        const args = AbstractCommand.mapToInput({
          names: names.length ? names : undefined,
        });

        await this.action.run(args, options);
      });
  }
}
