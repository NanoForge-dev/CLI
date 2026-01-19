import { Command } from "commander";

import { Input } from "@lib/input";

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
      .option("-d, --directory [directory]", "specify the directory of your project")
      .option("--generate", "generate app from config", false)
      .action(async (rawOptions: DevOptions) => {
        const options: Input = new Map();
        options.set("directory", { value: rawOptions.directory });
        options.set("config", { value: rawOptions.config });
        options.set("generate", { value: rawOptions.generate });

        const args: Input = new Map();

        await this.action.handle(args, options);
      });
  }
}
