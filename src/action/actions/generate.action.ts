import { join } from "node:path";

import { type Config } from "@lib/config";
import { type Input, getDirectoryInput, getEditorInput, getWatchInput } from "@lib/input";
import { Collection, CollectionFactory } from "@lib/schematics";
import { Messages } from "@lib/ui";

import { getCwd } from "@utils/path";

import { AbstractAction, type HandleResult } from "../abstract.action";
import { getConfig } from "../common/config";
import { executeSchematic } from "../common/schematics";

interface GenerateValues {
  directory: string;
  language: string;
  initFunctions: boolean;
}

export class GenerateAction extends AbstractAction {
  protected startMessage = Messages.GENERATE_START;
  protected successMessage = Messages.GENERATE_SUCCESS;
  protected failureMessage = Messages.GENERATE_FAILED;

  public async handle(_args: Input, options: Input): Promise<HandleResult> {
    const directory = getDirectoryInput(options);
    const config = await getConfig(options, directory);
    const isEditor = getEditorInput(options);
    const isWatch = getWatchInput(options);

    await this.generateParts(config, directory, isEditor, isWatch);

    if (isWatch) {
      return this.enterWatchMode();
    }

    return {};
  }

  private extractValues(config: Config): GenerateValues {
    return {
      directory: ".",
      language: config.language,
      initFunctions: config.initFunctions,
    };
  }

  private async generateParts(
    config: Config,
    directory: string,
    isEditor: boolean,
    watch: boolean,
  ): Promise<void> {
    const collection = CollectionFactory.create(Collection.NANOFORGE, directory);
    const values = this.extractValues(config);

    if (config.client.enable)
      await executeSchematic(
        "Client main file",
        collection,
        "part-main",
        {
          ...values,
          part: "client",
          outFile: !isEditor ? config.client.build.entry : config.client.editor.entry,
          saveFile: config.client.editor.save,
          editor: isEditor,
        },
        watch ? this.watchPath(directory, values.directory, config.client.editor.save) : undefined,
      );

    if (config.server.enable)
      await executeSchematic(
        "Server main file",
        collection,
        "part-main",
        {
          ...values,
          part: "server",
          outFile: !isEditor ? config.server.build.entry : config.server.editor.entry,
          saveFile: config.server.editor.save,
          editor: isEditor,
        },
        this.watchPath(directory, values.directory, config.server.editor.save),
      );
  }

  private watchPath(directory: string, subDir: string, saveFile: string): string {
    return join(getCwd(directory), subDir, saveFile);
  }

  private enterWatchMode(): HandleResult {
    console.info();
    console.info(Messages.GENERATE_WATCH_START);
    console.info();
    return { keepAlive: true };
  }
}
