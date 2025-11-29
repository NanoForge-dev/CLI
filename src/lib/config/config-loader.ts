import { existsSync, readFileSync } from "node:fs";
import { join } from "path";

import { Config } from "./config.type";

let config: Config | null;

const getConfigPath = (directory: string, name?: string) => {
  if (name) {
    return join(directory, name);
  } else {
    for (const n of ["nanoforge.config.js"]) {
      const path = join(directory, n);
      if (existsSync(path)) return path;
    }
  }
};

export const getConfig = async (directory: string, name?: string) => {
  if (config) return config;

  const path = getConfigPath(directory, name);
  if (!path) throw new Error("No config file found");
  try {
    config = JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    config = null;
  }
  if (!config) throw new Error(`Not able to read config file : ${path}`);
  return config;
};
