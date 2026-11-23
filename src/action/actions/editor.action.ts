import { cyan, yellow } from "ansis";
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
  // The editor is the only child: its own "Editor failed!" line already says it.
  protected override childFailureMessage = "";

  private readonly readyTimeoutMs = 30_000;

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
        `Port ${port} is already used by a NanoForge editor.`,
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

    const state = await this.waitForEditor(port, () => exited);
    if (state === "ready") {
      console.log(`\n🔗 Editor running! Open it in your browser: ${cyan(url)}\n`);
      if (shouldOpen) await this.openBrowser(url);
    } else if (state === "timeout") {
      console.log(
        yellow(`\nWarning: the editor has not answered yet. It may still be starting: ${url}\n`),
      );
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
   * started. Gives up after `readyTimeoutMs`.
   */
  private async waitForEditor(
    port: number,
    exited: () => boolean,
  ): Promise<"ready" | "exited" | "timeout"> {
    const deadline = Date.now() + this.readyTimeoutMs;
    while (Date.now() < deadline) {
      if (exited()) return "exited";
      if (await this.answers(port)) return "ready";
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    return exited() ? "exited" : "timeout";
  }

  /** Whether a NanoForge editor answers on the port: its /healthz returns `{ ok: true, version }`. */
  private async answers(port: number): Promise<boolean> {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/healthz`, {
        signal: AbortSignal.timeout(1000),
      });
      const body = (await response.json()) as { ok?: unknown };
      return response.ok && body?.ok === true;
    } catch {
      return false; // Not listening, not answering in time, or not the editor.
    }
  }

  private async openBrowser(url: string): Promise<void> {
    await open(url);
  }
}
