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

    const result = await withSpinner(
      () => Registry.publish(manifest, directory),
      Messages.PUBLISH_IN_PROGRESS(manifest.name),
    );

    const packageUrl = `https://www.npmjs.com/package/${manifest.name}`;
    console.log(`\n📦 Package published! View it here: \x1b[36m${packageUrl}\x1b[0m\n`);

    return result;
  }
}
