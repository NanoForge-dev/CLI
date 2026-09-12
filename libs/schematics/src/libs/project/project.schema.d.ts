export interface ProjectSchema {
  /**
   * The type of project to generate
   */
  part: "client" | "server";

  /**
   * Name of the parent workspace, used to derive the project package name
   */
  workspaceName: string | null;

  /**
   * Full destination path for this project (e.g. "apps/client",
   * "packages/player-client"). The caller is responsible for including any
   * part-specific segment - it is not appended automatically.
   */
  directory: string;

  /**
   * NanoForge project language
   */
  language: "js" | "ts";

  /**
   * With strict mode
   */
  strict: boolean;

  /**
   * The used package manager
   */
  packageManager: "npm" | "yarn" | "pnpm" | "bun";

  /**
   * Whether this project is generated inside an existing NanoForge workspace
   */
  workspace: boolean;

  /**
   * Generate a Dockerfile for the project. Ignored when `workspace` is true - a project
   * inside a workspace is built and run by the workspace's own Dockerfile instead.
   */
  docker: boolean;

  /**
   * Add init functions to the project
   */
  initFunctions: boolean;

  /**
   * Only meaningful when `part` is "client": whether the client syncs its
   * entity position from a companion server instead of owning it locally.
   * A server project always simulates and broadcasts its own position,
   * regardless of this flag.
   */
  hasServer: boolean;

  /**
   * Add editor dependencies
   */
  editor: boolean;

  /**
   * Relative paths to shared libs this project depends on
   */
  libs: string[];

  /**
   * Package names allowed to run install/build scripts. Only applies to a
   * standalone project (workspace: false) — a project generated inside a
   * workspace relies on the workspace root's own `allowBuilds` instead.
   * Written to pnpm-workspace.yaml's `allowBuilds` map (pnpm), package.json's
   * `allowScripts` map (npm) or `trustedDependencies` array (bun). Ignored
   * for yarn.
   */
  allowBuilds: string[];
}
