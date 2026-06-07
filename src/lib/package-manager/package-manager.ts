import { red } from "ansis";

import { createStderrLogger, createStdoutLogger } from "@lib/runner/process-logger";
import { type RunOptions, type Runner } from "@lib/runner/runner";
import { Messages } from "@lib/ui";

import { CLIError } from "@utils/errors";
import { getCwd } from "@utils/path";
import { withSpinner } from "@utils/spinner";

import { type PackageManagerCommands } from "./package-manager-commands";

export class PackageManager {
  constructor(
    public readonly name: string,
    private readonly commands: PackageManagerCommands,
    private readonly runner: Runner,
  ) {}

  public async install(directory: string): Promise<boolean> {
    const args = [this.commands.install, this.commands.silentFlag];

    const result = await withSpinner(
      () => this.exec(args, directory),
      Messages.PACKAGE_MANAGER_INSTALLATION_IN_PROGRESS,
      Messages.PACKAGE_MANAGER_INSTALLATION_SUCCEED(),
      Messages.PACKAGE_MANAGER_INSTALLATION_FAILED(this.formatFailCommand([this.commands.install])),
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

    const result = await withSpinner(
      () => this.exec(args, directory),
      message,
      Messages.BUILD_PART_SUCCESS(name),
      Messages.BUILD_PART_FAILED(name, this.formatFailCommand(args)),
    );

    return result.success;
  }

  public async run(
    name: string,
    directory: string,
    script: string,
    params: string[],
    env: Record<string, string> = {},
    flags: string[] = [],
    silent = false,
  ): Promise<boolean> {
    console.info(Messages.START_PART_IN_PROGRESS(name));

    try {
      const args = this.buildRunArgs(script, params, flags, silent);
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

  public async runFile(
    name: string,
    directory: string,
    script: string,
    params: string[],
    env: Record<string, string> = {},
    flags: string[] = [],
    silent = false,
  ): Promise<boolean> {
    console.info(Messages.START_PART_IN_PROGRESS(name));

    try {
      const args = this.buildRunFileArgs(script, params, flags, silent);
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
      const base = [this.commands.exec, command];
      if (this.commands.runArgsFlag) base.push(this.commands.runArgsFlag);
      await this.exec([...base, ...flags], directory, { collect, env });
      return true;
    } catch {
      return false;
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

    const result = await withSpinner(
      () => this.exec(args, directory),
      Messages.PACKAGE_MANAGER_INSTALLATION_IN_PROGRESS,
      Messages.PACKAGE_MANAGER_INSTALLATION_SUCCEED(),
      Messages.PACKAGE_MANAGER_INSTALLATION_FAILED(this.formatFailCommand(args)),
    );

    return result.success;
  }

  private assertSupports(feature: keyof PackageManagerCommands): void {
    if (!this.commands[feature]) {
      throw new CLIError(`Package manager "${this.name}" does not support "${feature}"`);
    }
  }

  private buildRunArgs(
    script: string,
    params: string[],
    flags: string[],
    silent: boolean,
  ): string[] {
    const args = [...flags, this.commands.run];
    if (silent) args.push(this.commands.silentFlag);
    args.push(script);
    if (params.length === 0) return args;
    if (this.commands.runArgsFlag) args.push(this.commands.runArgsFlag);
    return args.concat(params);
  }

  private buildRunFileArgs(
    script: string,
    params: string[],
    flags: string[],
    silent: boolean,
  ): string[] {
    if (!this.commands.runFile) throw new CLIError("Package manager does not support runFile");
    const args = [...flags, this.commands.runFile];
    if (silent) args.push(this.commands.silentFlag);
    args.push(script);
    if (params.length === 0) return args;
    if (this.commands.runArgsFlag) args.push(this.commands.runArgsFlag);
    return args.concat(params);
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

  private logEmpty(message: string): void {
    console.info();
    console.info(message);
    console.info();
  }
}
