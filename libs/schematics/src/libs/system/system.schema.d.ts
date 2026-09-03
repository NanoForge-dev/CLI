export interface SystemSchema {
  /**
   * System destination directory
   */
  name: string;

  /**
   * System destination directory
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
}
