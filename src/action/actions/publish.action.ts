import { zipFolder } from "@nanoforge-dev/registry";

import { type Input, getDirectoryInput } from "@lib/input";
import { loadManifest } from "@lib/manifest";
import { createAuthenticatedRegistry, isIgnoredWhenPublishing } from "@lib/registry";
import { Messages } from "@lib/ui";

import { getCwd } from "@utils/path";
import { withSpinner } from "@utils/spinner";

import { AbstractAction, type HandleResult } from "../abstract.action";

export class PublishAction extends AbstractAction {
  protected startMessage = Messages.PUBLISH_START;
  protected successMessage = Messages.PUBLISH_SUCCESS;
  protected failureMessage = Messages.PUBLISH_FAILED;

  /** Zips the package folder (secrets and installed folders left out) and publishes it. */
  public async handle(_args: Input, options: Input): Promise<HandleResult> {
    const directory = getDirectoryInput(options);
    const manifest = loadManifest(directory);
    const registry = createAuthenticatedRegistry(directory);

    return withSpinner(
      async () =>
        registry.publish(
          manifest.name,
          await zipFolder(getCwd(directory), { ignore: isIgnoredWhenPublishing }),
        ),
      Messages.PUBLISH_IN_PROGRESS(`${manifest.name}@${manifest.version}`),
    );
  }
}
