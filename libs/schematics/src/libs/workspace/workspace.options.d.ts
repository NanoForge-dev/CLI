export interface WorkspaceOptions {
  /**
   * NanoForge workspace name
   */
  name: string;

  /**
   * Version of engine packages (nanoforge, @nanoforge-dev/cli),
   * resolved to the newest registry release that respects MIN_RELEASE_AGE_HOURS.
   */
  engineVersion: string;

  /** Resolved @nanoforge-dev/cli version/protocol (see {@link engineVersion}). */
  cliVersion: string;

  /** Resolved typescript version (TypeScript language only). */
  typescriptVersion: string;

  /**
   * NanoForge workspace language
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
   * Package names allowed to run install/build scripts (always includes `bun`).
   * See {@link WorkspaceSchema.allowBuilds}.
   */
  allowBuilds: string[];

  /**
   * Generate a Dockerfile building every app in the workspace into one image
   */
  docker: boolean;
}
