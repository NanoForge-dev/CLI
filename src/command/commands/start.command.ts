import { type Command } from "commander";

import { CONFIG_FILE_NAME } from "@lib/constants";

import { AbstractCommand } from "../abstract.command";

interface StartOptions {
  directory?: string;
  config?: string;
  clientPort?: string;
  gameExposurePort?: string;
  serverPort?: string;
  watch?: boolean;
  cert?: string;
  key?: string;
}

export class StartCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("start")
      .description("start your game")
      .option("-d, --directory [directory]", "specify the directory of your project")
      .option("-c, --config [config]", "path to the config file", CONFIG_FILE_NAME)
      .option(
        "-p, --client-port [clientPort]",
        "specify the port of the loader (the website to load the game)",
      )
      .option("--game-exposure-port [gameExposurePort]", "specify the port of the game exposure")
      .option("--server-port [serverPort]", "specify the port of the server")
      .option("--watch", "run app in watching mode", false)
      .option("--cert [cert]", "path to the SSL certificate for HTTPS")
      .option("--key [key]", "path to the SSL key for HTTPS")
      .action(async (rawOptions: StartOptions) => {
        const options = AbstractCommand.mapToInput({
          directory: rawOptions.directory,
          config: rawOptions.config,
          clientPort: rawOptions.clientPort,
          gameExposurePort: rawOptions.gameExposurePort,
          serverPort: rawOptions.serverPort,
          watch: rawOptions.watch,
          cert: rawOptions.cert,
          key: rawOptions.key,
        });

        await this.action.run(new Map(), options);
      });
  }
}
