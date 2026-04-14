import open from "open";
import { join } from "path";

import { type Input, getDirectoryInput, getEditorOpenInput, getPathInput } from "@lib/input";
import { PackageManagerFactory, PackageManagerName } from "@lib/package-manager";
import { Messages } from "@lib/ui";

import { getModulePath } from "@utils/path";
import { runSafe } from "@utils/run-safe";

import { AbstractAction, type HandleResult } from "../abstract.action";

export class EditorAction extends AbstractAction {
  protected startMessage = Messages.EDITOR_START;
  protected successMessage = Messages.EDITOR_SUCCESS;
  protected failureMessage = Messages.EDITOR_FAILED;

  public async handle(args: Input, options: Input): Promise<HandleResult> {
    const directory = getDirectoryInput(options);
    const path = getPathInput(args);
    const open = getEditorOpenInput(options, !!path);

    void this.startEditor(directory);
    if (open) await this.openEditor(path);

    return { keepAlive: true };
  }

  private async startEditor(directory: string): Promise<void> {
    const editorPath = join(
      getModulePath("@nanoforge-dev/editor/package.json", true),
      "dist",
      "index.js",
    );

    await runSafe(async () => {
      const packageManager = PackageManagerFactory.create(PackageManagerName.LOCAL_BUN);
      await packageManager.run("Editor", directory, editorPath, [], {}, [], true);
    });
  }

  private async openEditor(path: string | undefined): Promise<void> {
    const query = path ? `?projectPath=${encodeURIComponent(path)}` : "";
    const url = `http://localhost:3000/load-project${query}`;
    await open(url);
  }
}
