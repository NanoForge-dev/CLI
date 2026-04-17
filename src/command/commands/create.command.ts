import { type Command } from "commander";

import { CONFIG_FILE_NAME } from "@lib/constants";

import { AbstractCommand } from "../abstract.command";

interface CreateOptions {
  directory?: string;
  config: string;
  name?: string;
  server: boolean;
  path?: string;
}

export class CreateCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("create <type>")
      .description("create nanoforge components or systems")
      .option("-d, --directory <directory>", "specify the working directory of the command")
      .option("-c, --config <config>", "path to the config file", CONFIG_FILE_NAME)
      .option("-n, --name <name>", "name of the component/system")
      .option(
        "-s, --server",
        "install components/systems on server (default install on client)",
        false,
      )
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
          config: rawOptions.config,
          name: rawOptions.name,
          server: rawOptions.server,
          path: rawOptions.path,
        });

        await this.action.run(args, options);
      });
  }
}
