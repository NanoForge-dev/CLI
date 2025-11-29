import * as ansis from "ansis";
import * as fs from "node:fs";
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
      const gameExposurePort = getStringInputWithDefault(
        options,
        "gameExposurePort",
        config.client.gameExposurePort,
      );
      const serverPort = getStringInputWithDefault(options, "serverPort", config.server.port);

      await Promise.all([
        config.server.enable
          ? this.startServer(directory, join(serverDir, "index.js"), serverPort)
          : undefined,
        this.startGameExposure(directory, clientDir, gameExposurePort, clientPort),
        this.startClient(clientPort, gameExposurePort),
      ]);
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }

  private async startClient(port: string, gameExposurePort: string): Promise<void> {
    const path = getModulePath("@nanoforge-dev/loader-client");

    fs.writeFileSync(
      join(path, "src/env.json"),
      JSON.stringify({
        GAME_EXPOSURE_URL: `http://localhost:${gameExposurePort}`,
      }),
    );

    await runPart("Client Loader build", path, "build:silent", undefined, ["--silent"]);

    return runPart("Client", path, "dist/index.html", {
      PORT: port,
      GAME_EXPOSURE_URL: `http://localhost:${gameExposurePort}`,
    });
  }

  private startGameExposure(
    directory: string,
    gameDir: string,
    port: string,
    clientPort: string,
  ): Promise<void> {
    const path = getModulePath("@nanoforge-dev/loader-server");
    return runPart("GameExposure", path, "dist/server.js", {
      PORT: port,
      GAME_DIR: getCwd(join(directory, gameDir)),
      CLIENT_URL: `http://localhost:${clientPort}`,
    });
  }

  private startServer(directory: string, file: string, port: string): Promise<void> {
    return runPart("Server", directory, file, { PORT: port });
  }
}

const runPart = async (
  part: string,
  directory: string,
  file: string,
  env?: Record<string, string>,
  flags?: string[],
) => {
  const packageManagerName = PackageManager.BUN;

  try {
    const packageManager = PackageManagerFactory.create(packageManagerName);
    await packageManager.run(part, directory, file, env, flags);
  } catch (error: any) {
    if (error && error.message) {
      console.error(ansis.red(error.message));
    }
  }
};
