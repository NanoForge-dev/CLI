import { bold, red } from "ansis";
import ora from "ora";
import { join } from "path";

import { AbstractRunner } from "../runner";
import { Messages } from "../ui";
import { normalizeToKebabCase } from "../utils/formatting";
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
      const commandArgs = `${this.cli.install} ${this.cli.silentFlag}`;
      const collect = true;
      const normalizedDirectory = normalizeToKebabCase(directory);
      await this.runner.run(
        commandArgs,
        collect,
        join(process.cwd(), normalizedDirectory),
      );
      spinner.succeed();
      this.printInstallSuccess();
    } catch {
      spinner.fail();
      const commandArgs = this.cli.install;
      const commandToRun = this.runner.rawFullCommand(commandArgs);
      this.printInstallFailure(commandToRun);
    }
  }

  public version(): Promise<string> {
    const commandArguments = "--version";
    const collect = true;
    return this.runner.run(commandArguments, collect) as Promise<string>;
  }

  public addProduction(
    directory: string,
    dependencies: string[],
  ): Promise<boolean> {
    const command = `${this.cli.add} ${this.cli.saveFlag}`;
    return this.add(command, directory, dependencies);
  }

  public addDevelopment(
    directory: string,
    dependencies: string[],
  ): Promise<boolean> {
    const command = `${this.cli.add} ${this.cli.saveDevFlag}`;
    return this.add(command, directory, dependencies);
  }

  async build(
    name: string,
    directory: string,
    entry: string,
    output: string,
  ): Promise<boolean> {
    if (!this.cli.build)
      throw new Error(`Package manager ${this.name} does not support building`);

    const spinner = SPINNER(Messages.BUILD_PART_IN_PROGRESS(name));
    spinner.start();
    try {
      const commandArgs = `${this.cli.build} ${this.cli.silentFlag} ${entry} --outdir ${output} --asset-naming "[name].[ext]"`;
      const collect = true;
      const normalizedDirectory = normalizeToKebabCase(directory);
      await this.runner.run(
        commandArgs,
        collect,
        join(process.cwd(), normalizedDirectory),
      );
      spinner.succeed();
      return true;
    } catch {
      spinner.fail();
      const commandArgs = this.cli.install;
      const commandToRun = this.runner.rawFullCommand(commandArgs);
      console.error(red(Messages.BUILD_PART_FAILED(name, bold(commandToRun))));
      return false;
    }
  }

  private async add(
    command: string,
    directory: string,
    dependencies: string[],
  ) {
    if (!dependencies.length) {
      console.info();
      console.info(Messages.PACKAGE_MANAGER_INSTALLATION_NOTHING);
      console.info();
      return true;
    }

    const args: string = dependencies
      .map((dependency) => `${dependency}`)
      .join(" ");

    const commandArguments = `${command} ${args}`;

    const spinner = SPINNER(Messages.PACKAGE_MANAGER_INSTALLATION_IN_PROGRESS);
    spinner.start();

    try {
      const collect = true;
      const normalizedDirectory = normalizeToKebabCase(directory);
      await this.runner.run(
        commandArguments,
        collect,
        join(process.cwd(), normalizedDirectory),
      );

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

  public abstract get name(): string;

  public abstract get cli(): PackageManagerCommands;
}
