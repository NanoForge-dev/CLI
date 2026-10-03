import open from "open";
import { join } from "path";

import {
  type Input,
  getDirectoryInput,
  getEditorOpenInput,
  getEditorPortInput,
  getPathInput,
} from "@lib/input";
import { PackageManagerFactory, PackageManagerName } from "@lib/package-manager";
import { Messages } from "@lib/ui";

import { editorUrl, resolveEditorTarget } from "@utils/editor-target";
import { getCwd, getModulePath } from "@utils/path";
import { runSafe } from "@utils/run-safe";

import { AbstractAction, type HandleResult } from "../abstract.action";

export class EditorAction extends AbstractAction {
  protected startMessage = Messages.EDITOR_START;
  protected successMessage = Messages.EDITOR_SUCCESS;
  protected failureMessage = Messages.EDITOR_FAILED;

  public async handle(args: Input, options: Input): Promise<HandleResult> {
    const directory = getDirectoryInput(options);
    const path = getPathInput(args);
    const port = getEditorPortInput(options);
    const shouldOpen = getEditorOpenInput(options, !!path);
    const target = resolveEditorTarget(getCwd(directory), path);
    const url = editorUrl(port, target);

    console.log(`\n🔗 Editor running! Open it in your browser: \x1b[36m${url}\x1b[0m\n`);

    void this.startEditor(target.fsRoot, port);
    if (shouldOpen && (await this.waitForEditor(port))) await this.openBrowser(url);

    return { keepAlive: true };
  }

  private async startEditor(fsRoot: string, port: number): Promise<void> {
    const editorPath = join(
      getModulePath("@nanoforge-dev/editor/package.json", true),
      "dist",
      "index.js",
    );

    await runSafe(async () => {
      const packageManager = PackageManagerFactory.create(PackageManagerName.LOCAL_BUN);
      await packageManager.run(
        "Editor",
        fsRoot,
        editorPath,
        [],
        { PORT: String(port), FS_ROOT: fsRoot },
        [],
        true,
      );
    });
  }

  /** Waits until the editor answers (up to 30 s) so the browser doesn't open on an error page. */
  private async waitForEditor(port: number): Promise<boolean> {
    for (const deadline = Date.now() + 30_000; Date.now() < deadline;) {
      try {
        const response = await fetch(`http://127.0.0.1:${port}/healthz`);
        if (response.ok) return true;
      } catch {
        // Not listening yet.
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    return false;
  }

  private async openBrowser(url: string): Promise<void> {
    await open(url);
  }
}
