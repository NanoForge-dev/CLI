import { existsSync } from "fs";
import { join, posix } from "path";

import { CommandLoader } from "~/command";

const localBinPathSegments = [process.cwd(), "node_modules", "@nanoforge-dev", "cli", "dist"];

export const localBinExists = () => {
  return existsSync(join(...localBinPathSegments));
};

export const loadLocalBinCommandLoader = async (): Promise<typeof CommandLoader> => {
  const commandsFile = await import(posix.join(...localBinPathSegments, "command.loader.js"));
  return commandsFile.CommandLoader;
};
