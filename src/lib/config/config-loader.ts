import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { CONFIG_FILE_NAME } from "@lib/constants";

import { deepMerge } from "@utils/object";

import { CONFIG_DEFAULTS } from "./config-defaults";
import { Config } from "./config.type";

let config: Config | null;

const getConfigPath = (directory: string, name?: string) => {
  if (name) {
    return join(directory, name);
  } else {
    for (const n of [CONFIG_FILE_NAME]) {
      const path = join(directory, n);
      if (existsSync(path)) return path;
    }
    throw new Error(`No config file found in directory: ${directory}`);
  }
};

export const loadConfig = async (directory: string, name?: string): Promise<Config> => {
  if (config) return config;

  let rawData;

  const path = getConfigPath(directory, name);
  try {
    rawData = deepMerge(CONFIG_DEFAULTS, JSON.parse(readFileSync(path, "utf-8")));
  } catch {
    rawData = null;
  }
  if (!rawData) throw new Error(`Not able to read config file : ${path}`);

  const data = plainToInstance(Config, rawData, {
    excludeExtraneousValues: true,
  });
  const errors = await validate(data);
  if (errors.length > 0)
    throw new Error(`Invalid config :\n${errors.toString().replace(/,/g, "\n")}`);

  config = data;
  return config;
};
