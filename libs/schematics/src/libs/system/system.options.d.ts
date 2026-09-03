export interface SystemOptions {
  /**
   * The part of the application to generate
   */
  part: "client" | "server";

  /**
   * System function name
   */
  functionName: string;

  /**
   * System filename
   */
  fileName: string;
}
