export interface WorkspaceSchema {
  /**
   * NanoForge workspace name
   */
  name: string;

  /**
   * NanoForge workspace destination directory
   */
  directory: string;

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
   * Package names allowed to run install/build scripts. Written to
   * pnpm-workspace.yaml's `allowBuilds` map (pnpm), package.json's
   * `allowScripts` map (npm) or `trustedDependencies` array (bun). Ignored
   * for yarn. `bun` is always included in addition to this list since
   * @nanoforge-dev/cli transitively depends on it and it has its own
   * install script.
   */
  allowBuilds: string[];

  /**
   * Generate a Dockerfile building every app in the workspace into one image
   */
  docker: boolean;
}
