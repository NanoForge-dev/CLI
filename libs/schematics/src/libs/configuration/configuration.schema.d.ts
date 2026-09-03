export interface ConfigurationSchema {
  /**
   * The name of the application
   */
  name: string;

  /**
   * NanoForge application destination directory
   */
  directory: string;

  /**
   * Configure a server for the application
   */
  server: boolean;

  /**
   * NanoForge Application language
   */
  language: "js" | "ts";

  /**
   * Add init functions to the application
   */
  initFunctions: boolean;
}
