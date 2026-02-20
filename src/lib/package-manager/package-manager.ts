import { bold, red } from "ansis";
import { type Ora } from "ora";

import { createStderrLogger, createStdoutLogger } from "@lib/runner/process-logger";
import { type RunOptions, type Runner } from "@lib/runner/runner";
import { Messages } from "@lib/ui";
import { getSpinner } from "@lib/ui/spinner";

import { getCwd } from "@utils/path";

import { type PackageManagerCommands } from "./package-manager-commands";

interface SpinnerTaskResult<T> {
  success: boolean;
  value?: T;
}

export class PackageManager {
  constructor(
    public readonly name: string,
    private readonly commands: PackageManagerCommands,
    private readonly runner: Runner,
  ) {}

  public async install(directory: string): Promise<boolean> {
    const args = [this.commands.install, this.commands.silentFlag];

    const result = await this.withSpinner(
      Messages.PACKAGE_MANAGER_INSTALLATION_IN_PROGRESS,
      async (spinner) => {
        await this.exec(args, directory, { onFail: () => spinner.fail() });
        this.logSuccess(Messages.PACKAGE_MANAGER_INSTALLATION_SUCCEED());
      },
      () => this.logFailure(this.formatFailCommand([this.commands.install])),
    );

    return result.success;
  }

  public async addProduction(directory: string, dependencies: string[]): Promise<boolean> {
    return this.addDependencies(this.commands.saveFlag, directory, dependencies);
  }

  public async addDevelopment(directory: string, dependencies: string[]): Promise<boolean> {
    return this.addDependencies(this.commands.saveDevFlag, directory, dependencies);
  }

  public async build(
    name: string,
    directory: string,
    entry: string,
    output: string,
    flags: string[] = [],
    watch = false,
  ): Promise<boolean> {
    this.assertSupports("build");

    const message = watch
      ? Messages.BUILD_PART_WATCH_IN_PROGRESS(name)
      : Messages.BUILD_PART_IN_PROGRESS(name);

    const args = [
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.commands.build!,
      this.commands.silentFlag,
      entry,
      "--outdir",
      output,
      ...flags,
    ];

    const result = await this.withSpinner(
      message,
      async (spinner) => {
        await this.exec(args, directory, { onFail: () => spinner.fail() });
      },
      () => this.logBuildFailure(name),
    );

    return result.success;
  }

  public async run(
    name: string,
    directory: string,
    script: string,
    env: Record<string, string> = {},
    flags: string[] = [],
    silent = false,
  ): Promise<boolean> {
    console.info(Messages.START_PART_IN_PROGRESS(name));

    try {
      const args = this.buildRunArgs(script, flags, silent);
      await this.exec(args, directory, {
        env,
        listeners: {
          onStdout: createStdoutLogger(name),
          onStderr: createStderrLogger(name),
        },
      });
      console.info(Messages.START_PART_SUCCESS(name));
      return true;
    } catch {
      console.error(red(Messages.START_PART_FAILED(name)));
      return false;
    }
  }

  public async runDev(
    directory: string,
    command: string,
    env: Record<string, string> = {},
    flags: string[] = [],
    collect = true,
  ): Promise<boolean> {
    try {
      await this.exec([this.commands.run, command, ...flags], directory, { collect, env });
      return true;
    } catch {
      return false;
    }
  }

  private async withSpinner<T>(
    message: string,
    task: (spinner: Ora) => Promise<T>,
    onError?: () => void,
  ): Promise<SpinnerTaskResult<T>> {
    const spinner = getSpinner(message);
    spinner.start();

    try {
      const value = await task(spinner);
      spinner.succeed();
      return { success: true, value };
    } catch {
      spinner.fail();
      if (onError) onError();
      return { success: false };
    }
  }

  private async addDependencies(
    saveFlag: string,
    directory: string,
    dependencies: string[],
  ): Promise<boolean> {
    if (!dependencies.length) {
      this.logEmpty(Messages.PACKAGE_MANAGER_INSTALLATION_NOTHING);
      return true;
    }

    const args = [this.commands.add, saveFlag, ...dependencies];

    const result = await this.withSpinner(
      Messages.PACKAGE_MANAGER_INSTALLATION_IN_PROGRESS,
      async (spinner) => {
        await this.exec(args, directory, { onFail: () => spinner.fail() });
        this.logSuccess(Messages.PACKAGE_MANAGER_INSTALLATION_SUCCEED(dependencies));
      },
      () => this.logFailure(this.formatFailCommand(args)),
    );

    return result.success;
  }

  private assertSupports(feature: keyof PackageManagerCommands): void {
    if (!this.commands[feature]) {
      throw new Error(`Package manager "${this.name}" does not support "${feature}"`);
    }
  }

  private buildRunArgs(script: string, flags: string[], silent: boolean): string[] {
    const args = [...flags, this.commands.run];
    if (silent) args.push(this.commands.silentFlag);
    args.push(script);
    return args;
  }

  private exec(
    args: string[],
    directory: string,
    options: {
      collect?: boolean;
      env?: Record<string, string>;
      listeners?: RunOptions["listeners"];
      onFail?: () => void;
    } = {},
  ): Promise<string | null> {
    return this.runner.run(args, {
      collect: options.collect ?? true,
      cwd: getCwd(directory),
      env: options.env,
      listeners: options.listeners,
      onFail: options.onFail,
    });
  }

  private formatFailCommand(args: string[]): string {
    return this.runner.fullCommand(args);
  }

  private logSuccess(message: string): void {
    console.info();
    console.info(message);
    console.info();
  }

  private logFailure(command: string): void {
    console.error(red(Messages.PACKAGE_MANAGER_INSTALLATION_FAILED(bold(command))));
  }

  private logBuildFailure(name: string): void {
    const command = this.formatFailCommand([this.commands.install]);
    console.error(red(Messages.BUILD_PART_FAILED(name, bold(command))));
  }

  private logEmpty(message: string): void {
    console.info();
    console.info(message);
    console.info();
  }
}
