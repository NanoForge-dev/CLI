import { type Input, getDirectoryInput } from "@lib/input";
import { loadManifest } from "@lib/manifest";
import { Registry } from "@lib/registry";
import { Messages } from "@lib/ui";

import { withSpinner } from "@utils/spinner";

import { AbstractAction, type HandleResult } from "../abstract.action";

export class UnpublishAction extends AbstractAction {
  protected startMessage = Messages.UNPUBLISH_START;
  protected successMessage = Messages.UNPUBLISH_SUCCESS;
  protected failureMessage = Messages.UNPUBLISH_FAILED;

  public async handle(_args: Input, options: Input): Promise<HandleResult> {
    const directory = getDirectoryInput(options);

    const manifest = await loadManifest(directory);

    return withSpinner(
      () => Registry.unpublish(manifest, directory),
      Messages.UNPUBLISH_IN_PROGRESS(manifest.name),
    );
  }
}
