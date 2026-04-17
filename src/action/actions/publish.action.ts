import { type Input, getDirectoryInput } from "@lib/input";
import { loadManifest } from "@lib/manifest";
import { Registry } from "@lib/registry";
import { Messages } from "@lib/ui";

import { withSpinner } from "@utils/spinner";

import { AbstractAction, type HandleResult } from "../abstract.action";

export class PublishAction extends AbstractAction {
  protected startMessage = Messages.PUBLISH_START;
  protected successMessage = Messages.PUBLISH_SUCCESS;
  protected failureMessage = Messages.PUBLISH_FAILED;

  public async handle(_args: Input, options: Input): Promise<HandleResult> {
    const directory = getDirectoryInput(options);

    const manifest = await loadManifest(directory);

    return withSpinner(
      () => Registry.publish(manifest, directory),
      Messages.PUBLISH_IN_PROGRESS(manifest.name),
    );
  }
}
