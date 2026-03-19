import { type Command } from "commander";

import { CONFIG_FILE_NAME } from "@lib/constants";

import { AbstractCommand } from "../abstract.command";

interface GenerateOptions {
  directory?: string;
  config?: string;
  editor?: boolean;
  watch?: boolean;
}

export class GenerateCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("generate")
      .description("generate nanoforge files from config")
      .option("-d, --directory [directory]", "specify the working directory of the command")
      .option("-c, --config [config]", "path to the config file", CONFIG_FILE_NAME)
      .option("--editor", "specify if the project must generate editor main file")
      .option("--watch", "generate app in watching mode", false)
      .action(async (rawOptions: GenerateOptions) => {
        const options = AbstractCommand.mapToInput({
          directory: rawOptions.directory,
          config: rawOptions.config,
          editor: rawOptions.editor,
          watch: rawOptions.watch,
        });

        await this.action.run(new Map(), options);
      });
  }
}
