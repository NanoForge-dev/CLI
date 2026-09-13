import { type NanoforgeConfig, parseConfig } from "@nanoforge-dev/config";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { ConfigNotFoundError } from "@utils/errors";

const CONFIG_BASE_NAME = "nanoforge.config";
const CONFIG_EXTENSIONS = ["ts", "js"];

const getConfigPath = (directory: string): string => {
  for (const ext of CONFIG_EXTENSIONS) {
    const path = join(directory, `${CONFIG_BASE_NAME}.${ext}`);
    if (existsSync(path)) return path;
  }
  throw new ConfigNotFoundError(join(directory, `${CONFIG_BASE_NAME}.ts`));
};

/**
 * Looks up a `nanoforge.config.ts` file in `directory`, falling back to
 * `nanoforge.config.js` when no `.ts` file exists. Throws a
 * `ConfigNotFoundError` when neither is present.
 */
export const loadConfig = async (directory: string): Promise<NanoforgeConfig> => {
  const path = getConfigPath(directory);
  return parseConfig(path);
};
