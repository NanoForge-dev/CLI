import { Command } from "commander";

import { Input } from "@lib/input";

import { AbstractCommand } from "../abstract.command";

interface StartOptions {
  directory?: string;
  config?: string;
  clientPort?: string;
  gameExposurePort?: string;
  serverPort?: string;
}

export class StartCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("start")
      .description("start your game")
      .option("-d, --directory [directory]", "specify the directory of your project")
      .option("-c, --config [config]", "path to the config file", "nanoforge.config.json")
      .option(
        "-p, --client-port [clientPort]",
        "specify the port of the loader (the website to load the game)",
      )
      .option("--game-exposure-port [gameExposurePort]", "specify the port of the game exposure")
      .option("--server-port [serverPort]", "specify the port of the server")
      .action(async (rawOptions: StartOptions) => {
        const options: Input = new Map();
        options.set("directory", { value: rawOptions.directory });
        options.set("config", { value: rawOptions.config });
        options.set("clientPort", { value: rawOptions.clientPort });
        options.set("gameExposurePort", {
          value: rawOptions.gameExposurePort,
        });
        options.set("serverPort", { value: rawOptions.serverPort });

        const args: Input = new Map();

        await this.action.handle(args, options);
      });
  }
}
