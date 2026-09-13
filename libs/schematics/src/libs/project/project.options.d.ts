export interface ProjectOptions {
  /**
   * The type of project to generate
   */
  part: "client" | "server";

  /**
   * Fully-qualified Nanoforge app class name for the generated part,
   * used in JSDoc type annotations for JavaScript projects
   */
  appClass: string;

  /**
   * The derived package.json name (from workspaceName and part)
   */
  packageName: string;

  /**
   * NanoForge project language
   */
  language: "js" | "ts";

  /**
   * With strict mode (TypeScript or JavaScript but only on compatible editor)
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
   * Resolved version/protocol for the @nanoforge-dev/ecs dependency (aliased
   * to @nanoforge-dev/ecs-lib for registry lookups; see project.factory.ts)
   */
  ecsVersion: string;

  /** Resolved version/protocol for @nanoforge-dev/graphics-2d (client only) */
  graphics2dVersion: string;

  /** Resolved version/protocol for @nanoforge-dev/input (client only) */
  inputVersion: string;

  /**
   * Resolved version/protocol for the @nanoforge-dev/network dependency
   * (aliased to @nanoforge-dev/network-client or -server for registry
   * lookups depending on `part`; see project.factory.ts)
   */
  networkVersion: string;

  /** Resolved version/protocol for the nanoforge engine package */
  nanoforgeVersion: string;

  /**
   * Add init functions to the project
   */
  initFunctions: boolean;

  /**
   * Only meaningful when `part` is "client": whether the client syncs its
   * entity position from a companion server instead of owning it locally.
   */
  hasServer: boolean;

  /**
   * Generate a Dockerfile for the project. Ignored when `workspace` is true - a project
   * inside a workspace is built and run by the workspace's own Dockerfile instead.
   */
  docker: boolean;

  /**
   * Add editor dependencies
   */
  editor: boolean;

  /**
   * Relative paths to shared libs this project depends on
   */
  libs: string[];

  /**
   * Package names allowed to run install/build scripts. Only rendered when
   * `workspace` is false — see {@link ProjectSchema.allowBuilds}.
   */
  allowBuilds: string[];
}
