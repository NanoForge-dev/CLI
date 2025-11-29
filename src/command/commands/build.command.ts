import { Command } from "commander";

import { Input } from "@lib/input";

import { AbstractCommand } from "../abstract.command";

interface BuildOptions {
  directory?: string;
  config?: string;
  clientOutDir?: string;
  serverOutDir?: string;
}

export class BuildCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("build")
      .description("build your game")
      .option("-d, --directory [directory]", "specify the directory of your project")
      .option("-c, --config [config]", "path to the config file", "nanoforge.config.json")
      .option("--client-outDir [clientDirectory]", "specify the output directory of the client")
      .option("--server-outDir [serverDirectory]", "specify the output directory of the server")
      .action(async (rawOptions: BuildOptions) => {
        const options: Input = new Map();
        options.set("directory", { value: rawOptions.directory });
        options.set("config", { value: rawOptions.config });
        options.set("clientDirectory", { value: rawOptions.clientOutDir });
        options.set("serverDirectory", { value: rawOptions.serverOutDir });

        const args: Input = new Map();

        await this.action.handle(args, options);
      });
  }
}
