export interface PartMainSchema {
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
   * Save file path with components and systems in JSON format
   */
  saveFile?: string;

  /**
   * Path of the out file
   */
  outFile?: string;

  /**
   * Build main editor
   */
  editor: boolean;
}
