import * as ansis from "ansis";
import * as fs from "node:fs";
import { join } from "path";

import { Input } from "../../command";
import { getConfig } from "../../lib/config/config-loader";
import {
  PackageManager,
  PackageManagerFactory,
} from "../../lib/package-manager";
import { Messages } from "../../lib/ui";
import { getCwd } from "../../lib/utils/path";
import { AbstractAction } from "../abstract.action";
import {
  getDirectoryInput,
  getStringInput,
  getStringInputWithDefault,
} from "../common/inputs";

export class StartAction extends AbstractAction {
  public async handle(args: Input, options: Input) {
    console.info(Messages.RUN_START);
    console.info();

    const directory = getDirectoryInput(options);

    const config = await getConfig(
      directory,
      getStringInput(options, "config"),
    );

    const clientDir = config.client.runtime.dir;
    const serverDir = config.server.runtime.dir;

    const clientPort = getStringInputWithDefault(
      options,
      "clientPort",
      config.client.port,
    );
    const gameExposurePort = getStringInputWithDefault(
      options,
      "gameExposurePort",
      config.client.gameExposurePort,
    );
    const serverPort = getStringInputWithDefault(
      options,
      "serverPort",
      config.server.port,
    );

    await Promise.all([
      config.server.enable
        ? this.startServer(directory, join(serverDir, "index.js"), serverPort)
        : undefined,
      this.startGameExposure(
        directory,
        clientDir,
        gameExposurePort,
        clientPort,
      ),
      this.startClient(clientPort, gameExposurePort),
    ]);
    process.exit(0);
  }

  private async startClient(
    port: string,
    gameExposurePort: string,
  ): Promise<void> {
    const path = join(
      __dirname,
      "../../../node_modules/@nanoforge-dev/loader-client",
    );

    fs.writeFileSync(
      join(path, "src/env.json"),
      JSON.stringify({
        GAME_EXPOSURE_URL: `http://localhost:${gameExposurePort}`,
      }),
    );

    await runPart("Client Loader build", path, "build:silent", undefined, [
      "--silent",
    ]);

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
    const path = join(
      __dirname,
      "../../../node_modules/@nanoforge-dev/loader-server",
    );
    return runPart("GameExposure", path, "dist/server.js", {
      PORT: port,
      GAME_DIR: getCwd(join(directory, gameDir)),
      CLIENT_URL: `http://localhost:${clientPort}`,
    });
  }

  private startServer(
    directory: string,
    file: string,
    port: string,
  ): Promise<void> {
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
  } catch (error) {
    if (error && error.message) {
      console.error(ansis.red(error.message));
    }
  }
};
