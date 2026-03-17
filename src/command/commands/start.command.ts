import { type Command } from "commander";

import { CONFIG_FILE_NAME } from "@lib/constants";

import { AbstractCommand } from "../abstract.command";

interface StartOptions {
  directory?: string;
  config?: string;
  port?: string;
  clientDir?: string;
  serverDir?: string;
  watch?: boolean;
  cert?: string;
  key?: string;
}

export class StartCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("start")
      .description("start your game")
      .option("-d, --directory [directory]", "specify the working directory of the command")
      .option("-c, --config [config]", "path to the config file", CONFIG_FILE_NAME)
      .option("-p, --port [port]", "specify the port of the loader (the website to load the game)")
      .option("--client-dir [clientDirectory]", "specify the directory of the client")
      .option("--server-dir [serverDirectory]", "specify the directory of the server")
      .option("--watch", "run app in watching mode", false)
      .option("--cert [cert]", "path to the SSL certificate for HTTPS")
      .option("--key [key]", "path to the SSL key for HTTPS")
      .action(async (rawOptions: StartOptions) => {
        const options = AbstractCommand.mapToInput({
          directory: rawOptions.directory,
          config: rawOptions.config,
          port: rawOptions.port,
          clientDir: rawOptions.clientDir,
          serverDir: rawOptions.serverDir,
          watch: rawOptions.watch,
          cert: rawOptions.cert,
          key: rawOptions.key,
        });

        await this.action.run(new Map(), options);
      });
  }
}
