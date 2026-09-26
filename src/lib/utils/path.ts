import fs from "fs";
import { dirname, join, resolve, sep } from "path";
import { fileURLToPath } from "url";

import { FileSystemError } from "@utils/errors";

export const getCwd = (directory: string) => {
  return resolve(directory);
};

export const getModulePath = (name: string, removeLast = false) => {
  const path = fileURLToPath(import.meta.resolve(name));
  if (removeLast) return path.endsWith(sep) ? path.slice(0, -1) : dirname(path);
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
  throw new FileSystemError("resolve binary", name);
};
