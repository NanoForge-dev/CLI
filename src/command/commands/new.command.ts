import { Command } from "commander";

import { Input } from "@lib/input";

import { AbstractCommand } from "../abstract.command";

interface NewOptions {
  directory?: string;
  config?: string;
  clientOutDir?: string;
  serverOutDir?: string;
}

export class NewCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("new")
      .description("create a new nanoforge project")
      .option("-d, --directory [directory]", "specify the directory of your project")
      .action(async (rawOptions: NewOptions) => {
        const options: Input = new Map();
        options.set("directory", { value: rawOptions.directory });

        const args: Input = new Map();

        await this.action.handle(args, options);
      });
  }
}
