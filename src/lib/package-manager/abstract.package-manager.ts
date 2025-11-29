import { bold, green, red, yellow } from "ansis";
import ora from "ora";

import { AbstractRunner } from "../runner";
import { Messages } from "../ui";
import { getCwd } from "../utils/path";
import { PackageManagerCommands } from "./package-manager-commands";

const SPINNER = (message: string) =>
  ora({
    text: message,
  });

export abstract class AbstractPackageManager {
  constructor(protected runner: AbstractRunner) {}

  public async install(directory: string) {
    const spinner = SPINNER(Messages.PACKAGE_MANAGER_INSTALLATION_IN_PROGRESS);
    spinner.start();
    try {
      const commandArgs = [this.cli.install, this.cli.silentFlag];
      const collect = true;
      await this.runner.run(commandArgs, collect, getCwd(directory));
      spinner.succeed();
      this.printInstallSuccess();
    } catch {
      spinner.fail();
      const commandArgs = [this.cli.install];
      const commandToRun = this.runner.rawFullCommand(commandArgs);
      this.printInstallFailure(commandToRun);
    }
  }

  public version(): Promise<string> {
    const commandArguments = ["--version"];
    const collect = true;
    return this.runner.run(commandArguments, collect) as Promise<string>;
  }

  public addProduction(
    directory: string,
    dependencies: string[],
  ): Promise<boolean> {
    const command = [this.cli.add, this.cli.saveFlag];
    return this.add(command, directory, dependencies);
  }

  public addDevelopment(
    directory: string,
    dependencies: string[],
  ): Promise<boolean> {
    const command = [this.cli.add, this.cli.saveDevFlag];
    return this.add(command, directory, dependencies);
  }

  async build(
    name: string,
    directory: string,
    entry: string,
    output: string,
    flags?: string[],
  ): Promise<boolean> {
    if (!this.cli.build)
      throw new Error(`Package manager ${this.name} does not support building`);

    const spinner = SPINNER(Messages.BUILD_PART_IN_PROGRESS(name));
    spinner.start();
    try {
      const commandArgs = [
        this.cli.build,
        this.cli.silentFlag,
        entry,
        "--outdir",
        output,
        ...(flags ?? []),
      ];
      const collect = true;
      await this.runner.run(commandArgs, collect, getCwd(directory));
      spinner.succeed();
      return true;
    } catch {
      spinner.fail();
      const commandArgs = [this.cli.install];
      const commandToRun = this.runner.rawFullCommand(commandArgs);
      console.error(red(Messages.BUILD_PART_FAILED(name, bold(commandToRun))));
      return false;
    }
  }

  async run(
    name: string,
    directory: string,
    file: string,
    env: Record<string, string> = {},
    flags: string[] = [],
  ): Promise<boolean> {
    if (!this.cli.run)
      throw new Error(`Package manager ${this.name} does not support running`);

    try {
      console.info(Messages.RUN_PART_IN_PROGRESS(name));
      const commandArgs = [...flags, this.cli.run, file];
      await this.runner.run(commandArgs, true, getCwd(directory), env, {
        onStdout: this.onRunStdout(name),
        onStderr: this.onRunStderr(name),
      });
      console.info(Messages.RUN_PART_SUCCESS(name));
      return true;
    } catch {
      console.error(red(Messages.RUN_PART_FAILED(name)));
      return false;
    }
  }

  private async add(args: string[], directory: string, dependencies: string[]) {
    if (!dependencies.length) {
      console.info();
      console.info(Messages.PACKAGE_MANAGER_INSTALLATION_NOTHING);
      console.info();
      return true;
    }

    const commandArguments = [...args, ...dependencies];

    const spinner = SPINNER(Messages.PACKAGE_MANAGER_INSTALLATION_IN_PROGRESS);
    spinner.start();

    try {
      const collect = true;
      await this.runner.run(commandArguments, collect, getCwd(directory));

      spinner.succeed();
      this.printInstallSuccess(dependencies);
      return true;
    } catch {
      spinner.fail();
      const commandToRun = this.runner.rawFullCommand(commandArguments);
      this.printInstallFailure(commandToRun);
      return false;
    }
  }

  private printInstallSuccess(dependencies?: string[]) {
    console.info();
    console.info(Messages.PACKAGE_MANAGER_INSTALLATION_SUCCEED(dependencies));
    console.info();
  }

  private printInstallFailure(command: string) {
    console.error(
      red(Messages.PACKAGE_MANAGER_INSTALLATION_FAILED(bold(command))),
    );
  }

  private onRunStdout = (name: string) => (chunk: string) => {
    chunk
      .toString()
      .replace(/\r\n|\n/g, "\n")
      .replace(/^\n+|\n+$/g, "")
      .split("\n")
      .forEach((line) => {
        const date = yellow(`[${new Date().toISOString()}]`);
        const prompt = green(`(${name}) INFO -`);
        console.info(`${date} ${prompt} ${line}`);
      });
  };

  private onRunStderr = (name: string) => (chunk: ArrayBuffer) => {
    chunk
      .toString()
      .replace(/\r\n|\n/g, "\n")
      .replace(/^\n+|\n+$/g, "")
      .split("\n")
      .forEach((line) => {
        const date = yellow(`[${new Date().toISOString()}]`);
        const prompt = red(`(${name}) ERROR -`);
        console.error(`${date} ${prompt} ${line}`);
      });
  };

  public abstract get name(): string;

  public abstract get cli(): PackageManagerCommands;
}
