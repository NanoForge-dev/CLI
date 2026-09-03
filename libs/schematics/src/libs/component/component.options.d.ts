export interface ComponentOptions {
  /**
   * The part of the application to generate
   */
  part: "client" | "server";

  /**
   * Component class name
   */
  className: string;

  /**
   * Component filename
   */
  fileName: string;
}
