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
      .description("create a component or a system in an app, or an editor plugin (create plugin)")
      .option("-d, --directory <directory>", "specify the working directory of the command")
      .option("-n, --name <name>", "name of the component/system, or @scope/name of the plugin")
      .option(
        "-p, --path <path>",
        "path to the component/system folder (default: <part>/<components|systems>), or the folder of the new plugin (default: its name)",
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
