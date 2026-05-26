import fs from "fs";
import { join, resolve } from "path";

export const getCwd = (directory: string) => {
  return resolve(directory);
};

export const getModulePath = (name: string, removeLast = false) => {
  const path = import.meta.resolve(name).replace(/^file:\/\//, "");
  if (removeLast) return path.split("/").slice(0, -1).join("/");
  return path;
};

export const resolveCLINodeBinaryPath = (name: string) => {
  let base = join(getModulePath("./", true), "..");
  while (base.length >= 1) {
    const path = join(base, "node_modules", ".bin", name);
    try {
      fs.accessSync(path);
      return path;
    } catch {
      base = join(base, "..");
    }
  }
  throw new Error("Could not find module path");
};
