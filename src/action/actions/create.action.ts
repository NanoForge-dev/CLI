import {
  type Input,
  getCreateNameInputOrAsk,
  getCreateTypeInput,
  getDirectoryInput,
  getPathInputWithDefault,
  getServerInput,
} from "@lib/input";
import { Collection, CollectionFactory } from "@lib/schematics";
import { Messages } from "@lib/ui";

import { capitalize } from "@utils/formatting";

import { AbstractAction, type HandleResult } from "../abstract.action";
import { getConfig } from "../common/config";
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
    const config = await getConfig(options, directory, true);

    const type = getCreateTypeInput(args);

    const name = await getCreateNameInputOrAsk(options);
    const isServer = getServerInput(options);
    const path = getPathInputWithDefault(
      options,
      config[isServer ? "server" : "client"].dirs[type === "component" ? "components" : "systems"],
    );

    await this.generateElement(directory, type, {
      name,
      directory: path,
      part: isServer ? "server" : "client",
      language: config.language,
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
