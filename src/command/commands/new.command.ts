import { type Command } from "commander";

import { AbstractCommand } from "../abstract.command";

interface NewOptions {
  directory?: string;
  name?: string;
  path?: string;
  packageManager?: string;
  language?: string;
  strict?: boolean;
  server?: boolean;
  initFunctions?: boolean;
  skipInstall?: boolean;
}

export class NewCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("new")
      .description("create a new nanoforge project")
      .option("-d, --directory [directory]", "specify the directory of your project")
      .option("--name [name]", "specify the name of your project")
      .option("--path [path]", "specify the path of your project")
      .option("--package-manager [packageManager]", "specify the package manager of your project")
      .option("--language [language]", "specify the language of your project")
      .option("--strict", "use strict mode")
      .option("--no-strict", "do not use strict mode")
      .option("--server", "create a server")
      .option("--no-server", "do not create a server")
      .option("--init-functions", "initialize functions")
      .option("--no-init-functions", "do not initialize functions")
      .option("--skip-install", "skip installing dependencies")
      .option("--no-skip-install", "do not skip installing dependencies")
      .action(async (rawOptions: NewOptions) => {
        const options = AbstractCommand.mapToInput({
          directory: rawOptions.directory,
          name: rawOptions.name,
          path: rawOptions.path,
          packageManager: rawOptions.packageManager,
          language: rawOptions.language,
          strict: rawOptions.strict,
          server: rawOptions.server,
          initFunctions: rawOptions.initFunctions,
          skipInstall: rawOptions.skipInstall,
        });

        await this.action.run(new Map(), options);
      });
  }
}
