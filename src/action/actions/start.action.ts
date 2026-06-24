import dotenv from "dotenv";
import { join, resolve } from "path";

import { type Config } from "@lib/config";
import {
  type Input,
  getDirectoryInput,
  getStringInput,
  getStringInputWithDefault,
  getWatchInput,
} from "@lib/input";
import { PackageManagerFactory } from "@lib/package-manager";
import { Messages } from "@lib/ui";

import { CLIError } from "@utils/errors";
import { getCwd, getModulePath } from "@utils/path";
import { runSafe } from "@utils/run-safe";

import { getConfig } from "~/action/common/config";

import { AbstractAction, type HandleResult } from "../abstract.action";

interface SSLOptions {
  cert: string;
  key: string;
}

interface FullEnv {
  client: Record<string, string>;
  server: Record<string, string>;
}

export class StartAction extends AbstractAction {
  protected startMessage = Messages.START_START;
  protected successMessage = Messages.START_SUCCESS;
  protected failureMessage = Messages.START_FAILED;

  public async handle(_args: Input, options: Input): Promise<HandleResult> {
    const directory = getDirectoryInput(options);
    const config = await getConfig(options, directory);
    const clientDir = getStringInputWithDefault(options, "clientDir", config.client.outDir);
    const serverDir = getStringInputWithDefault(options, "serverDir", config.server.outDir);
    const watch = getWatchInput(options);
    const port = getStringInputWithDefault(options, "port", config.client.port);
    const ssl = this.resolveSSL(options, config);

    const tasks = this.buildStartTasks(config, directory, {
      clientDir,
      serverDir,
      watch,
      port,
      ssl,
    });
    await Promise.all(tasks);

    return { keepAlive: true };
  }

  private resolveSSL(options: Input, config: Config): SSLOptions | undefined {
    const cliCert = getStringInput(options, "cert");
    const cliKey = getStringInput(options, "key");
    const isSslRequested = Boolean(cliCert || cliKey || config.ssl?.enable);

    if (!isSslRequested) return undefined;

    const cert = cliCert ? cliCert : config.ssl?.cert;
    const key = cliKey ? cliKey : config.ssl?.key;

    if (!cert) {
      throw new CLIError(
        "No certificate found for SSL.",
        "Please provide a certificate path with --cert or configure 'ssl.cert' in your nanoforge.config.json.",
      );
    }

    if (!key) {
      throw new CLIError(
        "No key found for SSL.",
        "Please provide a key path with --key or configure 'ssl.key' in your nanoforge.config.json.",
      );
    }

    return {
      cert,
      key,
    };
  }

  private buildStartTasks(
    config: Config,
    directory: string,
    options: {
      clientDir: string;
      serverDir: string;
      watch: boolean;
      port: string;
      ssl?: SSLOptions;
    },
  ): Promise<void>[] {
    const env = this.parseEnv(directory);
    const tasks: Promise<void>[] = [];
    const { clientDir, serverDir, watch, port, ssl } = options;

    if (config.server.enable)
      tasks.push(this.startServer(directory, config, { serverDir, watch }, env));

    if (config.client.enable)
      tasks.push(
        this.startClient(directory, config, { clientDir, serverDir, watch, port, ssl }, env),
      );

    return tasks;
  }

  private async startClient(
    directory: string,
    config: Config,
    options: {
      clientDir: string;
      serverDir: string;
      watch: boolean;
      port: string;
      ssl?: SSLOptions;
    },
    env: FullEnv,
  ): Promise<void> {
    const loaderPath = getModulePath("@nanoforge-dev/loader-client/package.json", true);

    const params = this.buildClientParams(directory, config, options);
    await this.runLoader("Client", loaderPath, params, env.client);
  }

  private async startServer(
    directory: string,
    config: Config,
    options: { serverDir: string; watch: boolean },
    env: FullEnv,
  ): Promise<void> {
    const loaderPath = getModulePath("@nanoforge-dev/loader-server/package.json", true);

    const params = this.buildServerParams(directory, config, options);
    await this.runLoader("Server", loaderPath, params, env.server);
  }

  private buildClientParams(
    directory: string,
    config: Config,
    options: {
      clientDir: string;
      serverDir: string;
      watch: boolean;
      port: string;
      ssl?: SSLOptions;
    },
  ): string[] {
    const params: Record<string, string | boolean> = {
      "-d": getCwd(join(directory, options.clientDir)),
      "-p": options.port,
    };
    if (options.watch) params["--watch"] = true;

    if (options.watch) {
      params["--watch"] = true;
      if (config.server.enable) {
        params["--watch-server-dir"] = getCwd(join(directory, options.serverDir));
      }
    }

    if (options.ssl) {
      params["--cert"] = options.ssl.cert;
      params["--key"] = options.ssl.key;
    }

    return this.buildParams(params);
  }

  private buildServerParams(
    directory: string,
    _config: Config,
    options: {
      serverDir: string;
      watch: boolean;
    },
  ): string[] {
    const params: Record<string, string | boolean> = {
      "-d": getCwd(join(directory, options.serverDir)),
    };
    if (options.watch) params["--watch"] = true;

    return this.buildParams(params);
  }

  private buildParams(params: Record<string, string | boolean>): string[] {
    return Object.entries(params)
      .map(([key, value]) => (typeof value === "string" ? [key, value] : [key]))
      .flat();
  }

  private parseEnv(dir: string): FullEnv {
    const prefix = "NANOFORGE_";
    const clientPrefix = `${prefix}CLIENT_`;
    const serverPrefix = `${prefix}SERVER_`;

    const rawEnv = {
      ...process.env,
    };
    dotenv.config({
      path: resolve(getCwd(join(dir, ".env"))),
      processEnv: rawEnv,
    });
    const baseEnv = Object.entries(rawEnv).filter(
      ([key, value]) => key.startsWith(prefix) && !!value,
    ) as [string, string][];

    return {
      client: Object.fromEntries(
        baseEnv
          .filter(([key]) => !key.startsWith(serverPrefix))
          .map(([key, value]) => [key.replace(clientPrefix, prefix), value]),
      ),
      server: Object.fromEntries(
        baseEnv
          .filter(([key]) => !key.startsWith(clientPrefix))
          .map(([key, value]) => [key.replace(serverPrefix, prefix), value]),
      ),
    };
  }

  private async runLoader(
    name: string,
    directory: string,
    params: string[],
    env: Record<string, string>,
  ): Promise<void> {
    await runSafe(async () => {
      const packageManager = await PackageManagerFactory.find(directory);
      await packageManager.run(name, directory, "start", params, env, [], true);
    });
  }
}
