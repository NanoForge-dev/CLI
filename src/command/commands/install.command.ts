import { Command } from "commander";

import { AbstractCommand } from "../abstract.command";
import { Input } from "../command.input.type";

interface InstallOptions {
  directory?: string;
}

export class InstallCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("install [names...]")
      .alias("add")
      .description("add NanoForge library to your project")
      .option(
        "-d, --directory [directory]",
        "specify the destination directory",
      )
      .action(async (names: string[], rawOptions: InstallOptions) => {
        const options: Input = new Map();
        options.set("directory", { value: rawOptions.directory });

        const args: Input = new Map();
        args.set("names", { value: names.length ? names : undefined });

        await this.action.handle(args, options);
      });
  }
}
