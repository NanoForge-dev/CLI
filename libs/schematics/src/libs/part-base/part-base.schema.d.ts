export interface PartBaseSchema {
  /**
   * NanoForge application destination directory
   */
  directory: string;

  /**
   * The part of the application to generate
   */
  part: "client" | "server";

  /**
   * NanoForge Application language
   */
  language: "js" | "ts";

  /**
   * Add init functions to the application
   */
  initFunctions: boolean;

  /**
   * Configure a server for the application
   */
  server: boolean;
}
