export interface DockerSchema {
  /**
   * Target directory for generated Docker files
   */
  directory: string;

  /**
   * NanoForge application package manager
   */
  packageManager: "npm" | "yarn" | "pnpm" | "bun";
}
