import { type ClientConfig, defaultClientConfig, defaultServerConfig } from "@nanoforge-dev/config";
import dotenv from "dotenv";
import { join, resolve } from "path";

import {
  type ResolvedProject,
  type WorkspaceConfig,
  parseWorkspaceConfig,
  resolveProjects,
} from "@lib/config";
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

import { AbstractAction, type HandleResult } from "../abstract.action";

interface SSLOptions {
  cert: string;
  key: string;
}

interface FullEnv {
  client: Record<string, string>;
  server: Record<string, string>;
}

interface ClientStartTarget {
  directory: string;
  outDir: string;
  platform: "client";
  port: string;
  ssl?: SSLOptions;
}

interface ServerStartTarget {
  directory: string;
  outDir: string;
  platform: "server";
}

type StartTarget = ClientStartTarget | ServerStartTarget;

const isClientTarget = (target: StartTarget): target is ClientStartTarget =>
  target.platform === "client";
const isServerTarget = (target: StartTarget): target is ServerStartTarget =>
  target.platform === "server";

export class StartAction extends AbstractAction {
  protected startMessage = Messages.START_START;
  protected successMessage = Messages.START_SUCCESS;
  protected failureMessage = Messages.START_FAILED;

  public async handle(_args: Input, options: Input): Promise<HandleResult> {
    const directory = getDirectoryInput(options);
    const workspaceConfig = await parseWorkspaceConfig(directory);
    const watch = getWatchInput(options);

    const targets = this.resolveTargets(workspaceConfig, directory, options);
    const serverTargets = targets.filter(isServerTarget);
    const clientTargets = targets.filter(isClientTarget);

    if (targets.length === 0) {
      throw new CLIError(
        `No client or server project found at '${directory}'.`,
        "Check your nanoforge.config's 'packages' patterns, or run 'nf new' to scaffold one.",
      );
    }

    const env = this.parseEnv(directory);
    const tasks = this.buildStartTasks(serverTargets, clientTargets, watch, env);
    await Promise.all(tasks);

    return { keepAlive: true };
  }

  private resolveSSL(options: Input, config: ClientConfig): SSLOptions | undefined {
    const cliCert = getStringInput(options, "cert");
    const cliKey = getStringInput(options, "key");
    const ssl = config.ssl;
    const configSsl = ssl && ssl.enable ? ssl : undefined;
    const isSslRequested = Boolean(cliCert || cliKey || configSsl);

    if (!isSslRequested) return undefined;

    const cert = cliCert ?? configSsl?.cert;
    const key = cliKey ?? configSsl?.key;

    if (!cert) {
      throw new CLIError(
        "No certificate found for SSL.",
        "Please provide a certificate path with --cert or configure 'ssl.cert' in your nanoforge.config.",
      );
    }

    if (!key) {
      throw new CLIError(
        "No key found for SSL.",
        "Please provide a key path with --key or configure 'ssl.key' in your nanoforge.config.",
      );
    }

    return { cert, key };
  }

  private resolveTargets(
    workspaceConfig: WorkspaceConfig,
    baseDirectory: string,
    options: Input,
  ): StartTarget[] {
    const projects = resolveProjects(workspaceConfig, baseDirectory);
    return projects.map((project) => this.createTarget(project, options));
  }

  private createTarget(project: ResolvedProject, options: Input): StartTarget {
    if (project.config.type === "server") {
      return {
        directory: project.directory,
        outDir: getStringInputWithDefault(
          options,
          "serverDir",
          project.config.out?.dir ?? defaultServerConfig.out.dir,
        ),
        platform: "server",
      };
    }

    return {
      directory: project.directory,
      outDir: getStringInputWithDefault(
        options,
        "clientDir",
        project.config.out?.dir ?? defaultClientConfig.out.dir,
      ),
      platform: "client",
      port: getStringInputWithDefault(
        options,
        "port",
        project.config.port ?? defaultClientConfig.port,
      ),
      ssl: this.resolveSSL(options, project.config),
    };
  }

  private buildStartTasks(
    serverTargets: ServerStartTarget[],
    clientTargets: ClientStartTarget[],
    watch: boolean,
    env: FullEnv,
  ): Promise<void>[] {
    const tasks: Promise<void>[] = [];

    for (const target of serverTargets) {
      tasks.push(this.startServer(target, watch, env));
    }

    for (const target of clientTargets) {
      tasks.push(this.startClient(target, { watch, serverTargets }, env));
    }

    return tasks;
  }

  private async startClient(
    target: ClientStartTarget,
    options: { watch: boolean; serverTargets: ServerStartTarget[] },
    env: FullEnv,
  ): Promise<void> {
    const loaderPath = getModulePath("@nanoforge-dev/loader-client/package.json", true);

    const params = this.buildClientParams(target, options);
    await this.runLoader("Client", loaderPath, params, env.client);
  }

  private async startServer(
    target: ServerStartTarget,
    watch: boolean,
    env: FullEnv,
  ): Promise<void> {
    const loaderPath = getModulePath("@nanoforge-dev/loader-server/package.json", true);

    const params = this.buildServerParams(target, watch);
    await this.runLoader("Server", loaderPath, params, env.server);
  }

  private buildClientParams(
    target: ClientStartTarget,
    options: { watch: boolean; serverTargets: ServerStartTarget[] },
  ): string[] {
    const params: Record<string, string | boolean> = {
      "-d": getCwd(join(target.directory, target.outDir)),
      "-p": target.port,
    };

    if (options.watch) {
      params["--watch"] = true;
      const [server] = options.serverTargets;
      if (server && options.serverTargets.length === 1) {
        params["--watch-server-dir"] = getCwd(join(server.directory, server.outDir));
      }
    }

    if (target.ssl) {
      params["--cert"] = target.ssl.cert;
      params["--key"] = target.ssl.key;
    }

    return this.buildParams(params);
  }

  private buildServerParams(target: ServerStartTarget, watch: boolean): string[] {
    const params: Record<string, string | boolean> = {
      "-d": getCwd(join(target.directory, target.outDir)),
    };
    if (watch) params["--watch"] = true;

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
