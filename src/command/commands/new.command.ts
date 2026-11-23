import { type Command, Option } from "commander";

import { AbstractCommand } from "../abstract.command";

interface NewOptions {
  directory?: string;
  name?: string;
  path?: string;
  packageManager?: string;
  language?: string;
  strict?: boolean;
  server?: boolean;
  skipInstall?: boolean;
  docker?: boolean;
  agents?: boolean;
  editor?: boolean;
  git?: boolean;
  gitRemote?: string | false;
}

export class NewCommand extends AbstractCommand {
  public load(program: Command) {
    program
      .command("new")
      .description("create a new NanoForge project")
      .option("-d, --directory <directory>", "specify the working directory of the command")
      .option("--name <name>", "specify the name of your project")
      .option(
        "--path <path>",
        "specify the relative path where your project will be created (default: name of the project)",
      )
      .addOption(
        new Option(
          "--package-manager <packageManager>",
          "specify the package manager of your project",
        ).choices(["npm", "yarn", "pnpm", "bun"]),
      )
      .addOption(
        new Option("--language <language>", "specify the language of your project").choices([
          "ts",
          "js",
        ]),
      )
      .option("--strict", "use strict mode")
      .option("--no-strict", "do not use strict mode")
      .option("--server", "create a server")
      .option("--no-server", "do not create a server")
      .option("--skip-install", "skip installing dependencies")
      .option("--no-skip-install", "do not skip installing dependencies")
      .option("--docker", "generate docker files")
      .option("--no-docker", "do not generate docker files")
      .option("--no-agents", "do not generate AGENTS.md and CLAUDE.md files for AI coding agents")
      .option("--editor", "add editor dependencies")
      .option("--git", "generate git repository")
      .option("--no-git", "do not generate git repository")
      .option(
        "--git-remote <gitRemote>",
        "setup git remote to git repository (required if --git is used)",
      )
      .option("--no-git-remote", "do not setup git remote to git repository")
      .action(async (rawOptions: NewOptions) => {
        const options = AbstractCommand.mapToInput({
          directory: rawOptions.directory,
          name: rawOptions.name,
          path: rawOptions.path,
          packageManager: rawOptions.packageManager,
          language: rawOptions.language,
          strict: rawOptions.strict,
          server: rawOptions.server,
          skipInstall: rawOptions.skipInstall,
          docker: rawOptions.docker,
          agents: rawOptions.agents,
          editor: rawOptions.editor,
          git: rawOptions.git,
        });

        if (typeof rawOptions.gitRemote === "boolean")
          options.set("gitRemote", { value: rawOptions.gitRemote ? undefined : "" });
        else if (rawOptions.gitRemote) options.set("gitRemote", { value: rawOptions.gitRemote });

        await this.action.run(new Map(), options);
      });
  }
}
