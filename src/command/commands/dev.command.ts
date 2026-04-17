import { type Command } from "commander";

import { CONFIG_FILE_NAME } from "@lib/constants";

import { AbstractCommand } from "../abstract.command";

interface DevOptions {
  directory?: string;
  config?: string;
  generate?: boolean;
}

export class DevCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("dev")
      .description("run your game in dev mode")
      .option("-d, --directory <directory>", "specify the working directory of the command")
      .option("-c, --config <config>", "path to the config file", CONFIG_FILE_NAME)
      .option("--generate", "generate app from config", false)
      .action(async (rawOptions: DevOptions) => {
        const options = AbstractCommand.mapToInput({
          directory: rawOptions.directory,
          config: rawOptions.config,
          generate: rawOptions.generate,
        });

        await this.action.run(new Map(), options);
      });
  }
}
