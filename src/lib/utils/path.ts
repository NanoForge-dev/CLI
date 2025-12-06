import { join } from "path";

export const getCwd = (directory: string) => {
  return directory.startsWith("/") ? directory : join(process.cwd(), directory);
};

export const getModulePath = (name: string, removeLast = false) => {
  const path = import.meta.resolve(name).replace(/^file:\/\//, "");
  if (removeLast) return path.split("/").slice(0, -1).join("/");
  return path;
};
