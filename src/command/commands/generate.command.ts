import { type Command } from "commander";

import { CONFIG_FILE_NAME } from "@lib/constants";

import { AbstractCommand } from "../abstract.command";

interface GenerateOptions {
  directory?: string;
  config?: string;
  watch?: boolean;
}

export class GenerateCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("generate")
      .description("generate nanoforge files from config")
      .option("-d, --directory [directory]", "specify the directory of your project")
      .option("-c, --config [config]", "path to the config file", CONFIG_FILE_NAME)
      .option("--watch", "generate app in watching mode", false)
      .action(async (rawOptions: GenerateOptions) => {
        const options = AbstractCommand.mapToInput({
          directory: rawOptions.directory,
          config: rawOptions.config,
          watch: rawOptions.watch,
        });

        await this.action.run(new Map(), options);
      });
  }
}
