export interface ComponentSchema {
  /**
   * Component destination directory
   */
  name: string;

  /**
   * Component destination directory
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
