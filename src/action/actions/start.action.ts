import * as ansis from "ansis";
import * as console from "node:console";
import * as process from "node:process";
import { join } from "path";

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

import { getConfig } from "~/action/common/config";

import { AbstractAction } from "../abstract.action";

export class StartAction extends AbstractAction {
  public async handle(_args: Input, options: Input) {
    console.info(Messages.RUN_START);
    console.info();

    try {
      const directory = getDirectoryInput(options);
      const config = await getConfig(options, directory);

      const clientDir = config.client.runtime.dir;
      const serverDir = config.server.runtime.dir;

      const clientPort = getStringInputWithDefault(options, "clientPort", config.client.port);
      const cert = getStringInput(options, "cert");
      const key = getStringInput(options, "key");

      const watch = getWatchInput(options);

      await Promise.all([
        config.server.enable ? this.startServer(directory, serverDir, watch) : undefined,
        this.startClient(
          clientPort,
          directory,
          clientDir,
          {
            watch,
            serverGameDir: config.server.enable ? serverDir : undefined,
          },
          cert,
          key,
        ),
      ]);
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }

  private async startClient(
    port: string,
    directory: string,
    gameDir: string,
    options?: {
      watch?: boolean;
      serverGameDir?: string;
    },
    cert?: string,
    key?: string,
  ): Promise<void> {
    const path = getModulePath("@nanoforge-dev/loader-client/package.json", true);

    const params: any = {
      PORT: port,
      GAME_DIR: getCwd(join(directory, gameDir)),
      CERT: cert ? join(getCwd(directory), cert) : undefined,
      KEY: key ? join(getCwd(directory), key) : undefined,
    };
    if (options?.watch) {
      params["WATCH"] = "true";
      if (options?.serverGameDir) {
        params["WATCH_SERVER_GAME_DIR"] = getCwd(join(directory, options.serverGameDir));
      }
    }

    return runPart("Client", path, params);
  }

  private startServer(directory: string, gameDir: string, watch: boolean): Promise<void> {
    const path = getModulePath("@nanoforge-dev/loader-server/package.json", true);

    const params: any = {
      GAME_DIR: getCwd(join(directory, gameDir)),
    };
    if (watch) params["WATCH"] = "true";

    return runPart("Server", path, params);
  }
}

const runPart = async (
  part: string,
  directory: string,
  env?: Record<string, string>,
  flags?: string[],
) => {
  try {
    const packageManager = await PackageManagerFactory.find(directory);
    await packageManager.run(part, directory, "start", env, flags, true);
  } catch (error: any) {
    if (error && error.message) {
      console.error(ansis.red(error.message));
    }
  }
};
