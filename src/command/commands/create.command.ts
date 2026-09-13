import { type Command } from "commander";

import { AbstractCommand } from "../abstract.command";

interface CreateOptions {
  directory?: string;
  name?: string;
  path?: string;
}

export class CreateCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("create <type>")
      .description("create nanoforge components or systems")
      .option("-d, --directory <directory>", "specify the working directory of the command")
      .option("-n, --name <name>", "name of the component/system")
      .option(
        "-p, --path <path>",
        "path to the component/system folder (default: <part>/<components|systems>)",
      )
      .action(async (type: string, rawOptions: CreateOptions) => {
        const args = AbstractCommand.mapToInput({
          type,
        });

        const options = AbstractCommand.mapToInput({
          directory: rawOptions.directory,
          name: rawOptions.name,
          path: rawOptions.path,
        });

        await this.action.run(args, options);
      });
  }
}
