import { type Command } from "commander";

import { CONFIG_FILE_NAME } from "@lib/constants";

import { AbstractCommand } from "../abstract.command";

interface BuildOptions {
  directory?: string;
  config?: string;
  clientOutDir?: string;
  serverOutDir?: string;
  watch?: boolean;
}

export class BuildCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("build")
      .description("build your game")
      .option("-d, --directory [directory]", "specify the directory of your project")
      .option("-c, --config [config]", "path to the config file", CONFIG_FILE_NAME)
      .option("--client-outDir [clientDirectory]", "specify the output directory of the client")
      .option("--server-outDir [serverDirectory]", "specify the output directory of the server")
      .option("--watch", "build app in watching mode", false)
      .action(async (rawOptions: BuildOptions) => {
        const options = AbstractCommand.mapToInput({
          directory: rawOptions.directory,
          config: rawOptions.config,
          clientDirectory: rawOptions.clientOutDir,
          serverDirectory: rawOptions.serverOutDir,
          watch: rawOptions.watch,
        });

        await this.action.run(new Map(), options);
      });
  }
}
