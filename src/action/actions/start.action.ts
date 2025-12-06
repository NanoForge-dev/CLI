import * as ansis from "ansis";
import * as console from "node:console";
import { join } from "path";

import { Input, getDirectoryInput, getStringInputWithDefault } from "@lib/input";
import { PackageManager, PackageManagerFactory } from "@lib/package-manager";
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

      await Promise.all([
        config.server.enable ? this.startServer(directory, serverDir) : undefined,
        this.startClient(clientPort, directory, clientDir),
      ]);
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }

  private async startClient(port: string, directory: string, gameDir: string): Promise<void> {
    const path = getModulePath("@nanoforge-dev/loader-client/package.json", true);

    return runPart("Client", path, {
      PORT: port,
      GAME_DIR: getCwd(join(directory, gameDir)),
    });
  }

  private startServer(directory: string, gameDir: string): Promise<void> {
    const path = getModulePath("@nanoforge-dev/loader-server/package.json", true);
    return runPart("Server", path, {
      GAME_DIR: getCwd(join(directory, gameDir)),
    });
  }
}

const runPart = async (
  part: string,
  directory: string,
  env?: Record<string, string>,
  flags?: string[],
) => {
  const packageManagerName = PackageManager.BUN;

  try {
    const packageManager = PackageManagerFactory.create(packageManagerName);
    await packageManager.run(part, directory, "start", env, flags, true);
  } catch (error: any) {
    if (error && error.message) {
      console.error(ansis.red(error.message));
    }
  }
};
