import { type Command } from "commander";

import { AbstractCommand } from "../abstract.command";

interface StartOptions {
  directory?: string;
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
      .option("-d, --directory <directory>", "specify the working directory of the command")
      .option("-p, --port <port>", "specify the port of the loader (the website to load the game)")
      .option("--client-dir <clientDirectory>", "specify the output directory of the client")
      .option("--server-dir <serverDirectory>", "specify the output directory of the server")
      .option("--watch", "run app in watching mode", false)
      .option("--cert <cert>", "path to the SSL certificate for HTTPS")
      .option("--key <key>", "path to the SSL key for HTTPS")
      .action(async (rawOptions: StartOptions) => {
        const options = AbstractCommand.mapToInput({
          directory: rawOptions.directory,
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
