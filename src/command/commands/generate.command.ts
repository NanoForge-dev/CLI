import { Command } from "commander";

import { Input } from "@lib/input";

import { AbstractCommand } from "../abstract.command";

interface GenerateOptions {
  directory?: string;
  config?: string;
}

export class GenerateCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("generate")
      .description("generate nanoforge files from config")
      .option("-d, --directory [directory]", "specify the directory of your project")
      .option("-c, --config [config]", "path to the config file", "nanoforge.config.json")
      .action(async (rawOptions: GenerateOptions) => {
        const options: Input = new Map();
        options.set("directory", { value: rawOptions.directory });
        options.set("config", { value: rawOptions.config });

        const args: Input = new Map();

        await this.action.handle(args, options);
      });
  }
}
