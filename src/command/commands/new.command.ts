import { Command } from "commander";

import { Input } from "@lib/input";

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
        const options: Input = new Map();
        options.set("directory", { value: rawOptions.directory });
        options.set("name", { value: rawOptions.name });
        options.set("path", { value: rawOptions.path });
        options.set("packageManager", { value: rawOptions.packageManager });
        options.set("language", { value: rawOptions.language });
        options.set("strict", { value: rawOptions.strict });
        options.set("server", { value: rawOptions.server });
        options.set("initFunctions", { value: rawOptions.initFunctions });
        options.set("skipInstall", { value: rawOptions.skipInstall });

        const args: Input = new Map();

        await this.action.handle(args, options);
      });
  }
}
