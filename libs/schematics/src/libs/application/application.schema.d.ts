export interface ApplicationSchema {
  /**
   * NanoForge application name
   */
  name: string;

  /**
   * NanoForge application version
   */
  version?: string;

  /**
   * NanoForge application author
   */
  author?: string;

  /**
   * NanoForge application description
   */
  description?: string;

  /**
   * NanoForge application destination directory
   */
  directory?: string;

  /**
   * NanoForge Application language
   */
  language?: "js" | "ts";

  /**
   * With strict mode (TypeScript or JavaScript but only on compatible editor)
   */
  strict?: boolean;

  /**
   * Generate lint files
   */
  lint?: boolean;

  /**
   * The used package manager
   */
  packageManager?: "npm" | "yarn" | "pnpm" | "bun";

  /**
   * Configure a server for the application
   */
  server?: boolean;

  /**
   * Add editor dependencies
   */
  editor: boolean;

  /**
   * Add init functions to the application
   */
  initFunctions: boolean;
}
