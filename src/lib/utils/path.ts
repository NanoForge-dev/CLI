import { join } from "path";

export const getCwd = (directory: string) => {
  return directory.startsWith("/") ? directory : join(process.cwd(), directory);
};

export const getModulePath = (name: string) => {
  return import.meta.resolve(name).replace(/^file:\/\//, "");
};
