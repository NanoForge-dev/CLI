import { resolve } from "path";

export const getCwd = (directory: string) => {
  return resolve(directory);
};

export const getModulePath = (name: string, removeLast = false) => {
  const path = import.meta.resolve(name).replace(/^file:\/\//, "");
  if (removeLast) return path.split("/").slice(0, -1).join("/");
  return path;
};

export const getNodeBinaryPath = (name: string) => {
  return resolve("node_modules", ".bin", name);
};
