export interface PartBaseOptions {
  /**
   * The part of the application to generate
   */
  part: "client" | "server";

  /**
   * App class name
   */
  appClass: string;

  /**
   * Configure a server for the application
   */
  server: boolean;

  /**
   * Name of Nanoforge folder
   */
  nanoforgeFolder: string;
}
