import { cyan } from "ansis";
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
import { CLIError } from "@utils/errors";
import { getCwd, getModulePath } from "@utils/path";

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

    // Else the /healthz of the editor already there would be taken for this one's.
    if (await this.answers(port)) {
      throw new CLIError(
        `Port ${port} is already used by a running editor.`,
        "Open that editor, stop it, or pass another --port.",
      );
    }

    const editor = this.startEditor(target.fsRoot, port);
    // Started now, so a Ctrl+C during startup is not taken for a failure.
    const result = this.waitForChildren([editor]);
    let exited = false;
    void editor.then(
      () => (exited = true),
      () => (exited = true),
    );

    if (await this.waitForEditor(port, () => exited)) {
      console.log(`\n🔗 Editor running! Open it in your browser: ${cyan(url)}\n`);
      if (shouldOpen) await this.openBrowser(url);
    }

    return result;
  }

  private async startEditor(fsRoot: string, port: number): Promise<boolean> {
    const editorPath = join(
      getModulePath("@nanoforge-dev/editor/package.json", true),
      "dist",
      "index.js",
    );

    const packageManager = PackageManagerFactory.create(PackageManagerName.LOCAL_BUN);
    return packageManager.run(
      "Editor",
      fsRoot,
      editorPath,
      [],
      // Pinned so a game's own `.env` (HOST, PUBLIC_MODE), which Bun loads from fsRoot, can't stop the editor.
      { PORT: String(port), FS_ROOT: fsRoot, HOST: "127.0.0.1", PUBLIC_MODE: "OFFLINE" },
      [],
      true,
    );
  }

  /**
   * Waits until the editor answers, so its URL isn't shown (nor the browser opened) before it
   * started. `false` when the editor exited first.
   */
  private async waitForEditor(port: number, exited: () => boolean): Promise<boolean> {
    while (!exited()) {
      if (await this.answers(port)) return true;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    return false;
  }

  private async answers(port: number): Promise<boolean> {
    try {
      return (await fetch(`http://127.0.0.1:${port}/healthz`)).ok;
    } catch {
      return false; // Not listening.
    }
  }

  private async openBrowser(url: string): Promise<void> {
    await open(url);
  }
}
