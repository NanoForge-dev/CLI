import { join } from "node:path";

import { type Config } from "@lib/config";
import { NANOFORGE_DIR } from "@lib/constants";
import { type Input, getDirectoryInput, getWatchInput } from "@lib/input";
import { Collection, CollectionFactory } from "@lib/schematics";
import { Messages } from "@lib/ui";

import { getCwd } from "@utils/path";

import { getConfig } from "~/action/common/config";

import { AbstractAction, type HandleResult } from "../abstract.action";
import { executeSchematic } from "../common/schematics";

interface GenerateValues {
  name: string;
  directory: string;
  language: string;
  server: boolean;
  initFunctions: boolean;
}

export class GenerateAction extends AbstractAction {
  protected startMessage = Messages.GENERATE_START;
  protected successMessage = Messages.GENERATE_SUCCESS;
  protected failureMessage = Messages.GENERATE_FAILED;

  public async handle(_args: Input, options: Input): Promise<HandleResult> {
    const directory = getDirectoryInput(options);
    const config = await getConfig(options, directory);
    const isWatch = getWatchInput(options);

    const values = this.extractValues(config);
    await this.generateParts(values, directory, isWatch);

    if (isWatch) {
      return this.enterWatchMode();
    }

    return {};
  }

  private extractValues(config: Config): GenerateValues {
    return {
      name: config.name,
      directory: ".",
      language: config.language,
      server: config.server.enable,
      initFunctions: config.initFunctions,
    };
  }

  private async generateParts(
    values: GenerateValues,
    directory: string,
    watch: boolean,
  ): Promise<void> {
    const collection = CollectionFactory.create(Collection.NANOFORGE, directory);
    const baseOptions = this.baseSchematicOptions(values);

    await executeSchematic(
      "Client main file",
      collection,
      "part-main",
      { ...baseOptions, part: "client" },
      watch ? this.watchPath(directory, values.directory, "client") : undefined,
    );

    if (values.server) {
      await executeSchematic(
        "Server main file",
        collection,
        "part-main",
        { ...baseOptions, part: "server" },
        this.watchPath(directory, values.directory, "server"),
      );
    }
  }

  private baseSchematicOptions(values: GenerateValues) {
    return {
      name: values.name,
      directory: values.directory,
      language: values.language,
      initFunctions: values.initFunctions,
    };
  }

  private watchPath(directory: string, subDir: string, part: string): string {
    return join(getCwd(directory), subDir, NANOFORGE_DIR, `${part}.save.json`);
  }

  private enterWatchMode(): HandleResult {
    console.info();
    console.info(Messages.GENERATE_WATCH_START);
    console.info();
    return { keepAlive: true };
  }
}
