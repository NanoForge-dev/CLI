export interface ProjectSchema {
  /**
   * The type of project to generate
   */
  part: "client" | "server";

  /**
   * Name of the parent workspace, used to derive the project package name.
   * Optional - when omitted, `name` is used as the whole package name
   * instead of being appended to the workspace name.
   */
  workspaceName?: string | null;

  /**
   * Name used to derive the project package name. When `workspaceName` is
   * set, the package name is `${workspaceName}-${name}` (replacing the
   * previous `${workspaceName}-${part}` suffix). When `workspaceName` is
   * absent, `name` becomes the whole package name. Defaults to `part`.
   */
  name?: string | null;

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
}
