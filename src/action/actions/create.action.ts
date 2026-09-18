import { defaultClientConfig, defaultServerConfig } from "@nanoforge-dev/config";

import { parseWorkspaceConfig } from "@lib/config";
import {
  type Input,
  getCreateNameInputOrAsk,
  getCreateTypeInput,
  getDirectoryInput,
  getPathInputWithDefault,
} from "@lib/input";
import { Collection, CollectionFactory } from "@lib/schematics";
import { Messages } from "@lib/ui";

import { CLIError } from "@utils/errors";
import { capitalize } from "@utils/formatting";

import { AbstractAction, type HandleResult } from "../abstract.action";
import { executeSchematic } from "../common/schematics";

interface CreateValues {
  name: string;
  directory: string;
  part: "client" | "server";
  language: "ts" | "js";
}

export class CreateAction extends AbstractAction {
  protected startMessage = Messages.CREATE_START;
  protected successMessage = Messages.CREATE_SUCCESS;
  protected failureMessage = Messages.CREATE_FAILED;

  public async handle(args: Input, options: Input): Promise<HandleResult> {
    const directory = getDirectoryInput(options);
    const workspaceConfig = await parseWorkspaceConfig(directory);

    if (workspaceConfig.type === "workspace") {
      throw new CLIError(
        `Cannot run 'create' at a workspace root ('${directory}').`,
        "Run it from within a specific client/server project directory instead (-d <project-directory>).",
      );
    }

    const { config } = workspaceConfig;
    const isClient = config.type === "client";
    const defaults = isClient ? defaultClientConfig : defaultServerConfig;

    const type = getCreateTypeInput(args);

    const name = await getCreateNameInputOrAsk(options);
    const path = getPathInputWithDefault(
      options,
      config.dir?.[type === "component" ? "components" : "systems"] ??
        defaults.dir[type === "component" ? "components" : "systems"],
    );

    await this.generateElement(directory, type, {
      name,
      directory: path,
      part: config.type,
      language: config.language ?? defaults.language,
    });

    return {};
  }

  private async generateElement(
    directory: string,
    type: "component" | "system",
    values: CreateValues,
  ): Promise<void> {
    const collection = CollectionFactory.create(Collection.NANOFORGE, directory);
    await executeSchematic(capitalize(type), collection, type, values);
  }
}
