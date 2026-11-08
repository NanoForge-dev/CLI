import { readArchive, zipFolder } from "@nanoforge-dev/registry";

import { type Input, getDirectoryInput, getDryRunInput } from "@lib/input";
import { loadManifest } from "@lib/manifest";
import { createAuthenticatedRegistry, publishIgnore } from "@lib/registry";
import { Messages } from "@lib/ui";

import { getCwd } from "@utils/path";
import { withSpinner } from "@utils/spinner";

import { AbstractAction, type HandleResult } from "../abstract.action";

const formatSize = (bytes: number): string =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KiB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MiB`;

export class PublishAction extends AbstractAction {
  protected startMessage = Messages.PUBLISH_START;
  protected successMessage = Messages.PUBLISH_SUCCESS;
  protected failureMessage = Messages.PUBLISH_FAILED;

  /**
   * Zips what the manifest names (secrets left out), lists what it packed, and publishes it;
   * `--dry-run` stops after the list.
   */
  public async handle(_args: Input, options: Input): Promise<HandleResult> {
    const directory = getDirectoryInput(options);
    const manifest = loadManifest(directory);
    const subject = `${manifest.name}@${manifest.version}`;
    const root = getCwd(directory);
    const archive = await zipFolder(root, { ignore: await publishIgnore(root, manifest) });

    const files = [...readArchive(archive)];
    for (const [path, content] of files) console.info(`  ${path} (${formatSize(content.length)})`);
    const unpacked = files.reduce((total, [, content]) => total + content.length, 0);
    console.info(Messages.PUBLISH_FILES(subject, files.length, formatSize(unpacked)));

    if (getDryRunInput(options)) {
      this.successMessage = Messages.PUBLISH_DRY_RUN_SUCCESS;
      return { success: true };
    }
    const registry = createAuthenticatedRegistry(directory);
    return withSpinner(
      () => registry.publish(manifest.name, archive),
      Messages.PUBLISH_IN_PROGRESS(subject),
    );
  }
}
