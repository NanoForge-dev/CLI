import { join } from "path";

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

import { getCwd, getModulePath } from "@utils/path";
import { runSafe } from "@utils/run-safe";

import { getConfig } from "~/action/common/config";

import { AbstractAction, type HandleResult } from "../abstract.action";

interface PortOptions {
  clientPort: string;
  gameExposurePort?: string;
  serverPort?: string;
}

interface SSLOptions {
  cert: string;
  key: string;
}

export class StartAction extends AbstractAction {
  protected startMessage = Messages.START_START;
  protected successMessage = Messages.START_SUCCESS;
  protected failureMessage = Messages.START_FAILED;

  public async handle(_args: Input, options: Input): Promise<HandleResult> {
    const directory = getDirectoryInput(options);
    const config = await getConfig(options, directory);
    const watch = getWatchInput(options);
    const ports = this.resolvePorts(options, config);
    const ssl = this.resolveSSL(options);

    const tasks = this.buildStartTasks(config, directory, watch, ports, ssl);
    await Promise.all(tasks);

    return { keepAlive: true };
  }

  private resolvePorts(options: Input, config: Config): PortOptions {
    return {
      clientPort: getStringInputWithDefault(options, "clientPort", config.client.port),
      gameExposurePort: getStringInput(options, "gameExposurePort"),
      serverPort: getStringInput(options, "serverPort"),
    };
  }

  private resolveSSL(options: Input): SSLOptions | undefined {
    const cert = getStringInput(options, "cert");
    const key = getStringInput(options, "key");

    if (!cert && !key) return undefined;

    if (!cert) throw new Error("No cert entered for SSL. Please enter a key with --cert.");
    if (!key) throw new Error("No key entered for SSL. Please enter a key with --key.");

    return {
      cert,
      key,
    };
  }

  private buildStartTasks(
    config: Config,
    directory: string,
    watch: boolean,
    ports: PortOptions,
    ssl?: SSLOptions,
  ): Promise<void>[] {
    const tasks: Promise<void>[] = [];

    if (config.server.enable) {
      tasks.push(this.startServer(directory, config.server.runtime.dir, watch, ports.serverPort));
    }

    tasks.push(this.startClient(directory, config, watch, ports, ssl));

    return tasks;
  }

  private async startClient(
    directory: string,
    config: Config,
    watch: boolean,
    ports: PortOptions,
    ssl?: SSLOptions,
  ): Promise<void> {
    const loaderPath = getModulePath("@nanoforge-dev/loader-client/package.json", true);
    const gameDir = config.client.runtime.dir;

    const env = this.buildClientEnv(directory, gameDir, watch, config, ports, ssl);
    await this.runLoader("Client", loaderPath, env);
  }

  private buildClientEnv(
    directory: string,
    gameDir: string,
    watch: boolean,
    config: Config,
    ports: PortOptions,
    ssl?: SSLOptions,
  ): Record<string, string> {
    const env: Record<string, string> = {
      PORT: ports.clientPort,
      GAME_DIR: getCwd(join(directory, gameDir)),
    };

    if (ports.gameExposurePort) {
      env["GAME_EXPOSURE_PORT"] = ports.gameExposurePort;
    }

    if (watch) {
      env["WATCH"] = "true";
      if (config.server.enable) {
        env["WATCH_SERVER_GAME_DIR"] = getCwd(join(directory, config.server.runtime.dir));
      }
    }

    if (ssl) {
      env["CERT"] = ssl.cert;
      env["KEY"] = ssl.key;
    }

    return env;
  }

  private async startServer(
    directory: string,
    gameDir: string,
    watch: boolean,
    port?: string,
  ): Promise<void> {
    const loaderPath = getModulePath("@nanoforge-dev/loader-server/package.json", true);

    const env: Record<string, string> = {
      GAME_DIR: getCwd(join(directory, gameDir)),
    };
    if (port) env["PORT"] = port;
    if (watch) env["WATCH"] = "true";

    await this.runLoader("Server", loaderPath, env);
  }

  private async runLoader(
    name: string,
    directory: string,
    env: Record<string, string>,
  ): Promise<void> {
    await runSafe(async () => {
      const packageManager = await PackageManagerFactory.find(directory);
      await packageManager.run(name, directory, "start", env, [], true);
    });
  }
}
