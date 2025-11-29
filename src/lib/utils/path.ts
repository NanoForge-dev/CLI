import { join } from "path";

export const getCwd = (directory: string) => {
  return directory.startsWith("/") ? directory : join(process.cwd(), directory);
};
