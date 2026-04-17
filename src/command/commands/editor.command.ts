import { type Command } from "commander";

import { AbstractCommand } from "../abstract.command";

interface EditorOptions {
  directory?: string;
  open?: boolean;
}

export class EditorCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("editor [path]")
      .description("start the editor")
      .option("-d, --directory <directory>", "specify the working directory of the command")
      .option(
        "--open",
        "open the editor on the default web browser (default: true if path is specified, false otherwise)",
      )
      .option("--no-open", "do not open the editor on the default web browser")
      .action(async (path: string, rawOptions: EditorOptions) => {
        const args = AbstractCommand.mapToInput({
          path,
        });

        const options = AbstractCommand.mapToInput({
          directory: rawOptions.directory,
          open: rawOptions.open,
        });

        await this.action.run(args, options);
      });
  }
}
