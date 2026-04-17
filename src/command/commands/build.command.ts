import { type Command } from "commander";

import { CONFIG_FILE_NAME } from "@lib/constants";

import { AbstractCommand } from "../abstract.command";

interface BuildOptions {
  directory?: string;
  config?: string;
  clientEntry?: string;
  serverEntry?: string;
  clientStaticDir?: string;
  serverStaticDir?: string;
  clientOutDir?: string;
  serverOutDir?: string;
  editor?: boolean;
  watch?: boolean;
}

export class BuildCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("build")
      .description("build your game")
      .option("-d, --directory <directory>", "specify the working directory of the command")
      .option("-c, --config <config>", "path to the config file", CONFIG_FILE_NAME)
      .option("--client-entry <clientEntry>", "specify the entry file of the client")
      .option("--server-entry <serverEntry>", "specify the entry file of the server")
      .option("--client-static-dir <clientStaticDir>", "specify the static directory of the client")
      .option("--server-static-dir <serverStaticDir>", "specify the static directory of the server")
      .option("--client-out-dir <clientOutDir>", "specify the output directory of the client")
      .option("--server-out-dir <serverOutDir>", "specify the output directory of the server")
      .option("--editor", "specify if the project must build with editor config")
      .option("--watch", "build app in watching mode", false)
      .action(async (rawOptions: BuildOptions) => {
        const options = AbstractCommand.mapToInput({
          directory: rawOptions.directory,
          config: rawOptions.config,
          clientEntry: rawOptions.clientEntry,
          serverEntry: rawOptions.serverEntry,
          clientStaticDir: rawOptions.clientStaticDir,
          serverStaticDir: rawOptions.serverStaticDir,
          clientOutDir: rawOptions.clientOutDir,
          serverOutDir: rawOptions.serverOutDir,
          editor: rawOptions.editor,
          watch: rawOptions.watch,
        });

        await this.action.run(new Map(), options);
      });
  }
}
