import { existsSync } from "fs";
import { join, posix, win32 } from "path";
import { pathToFileURL } from "url";

import { type CommandLoader } from "~/command";

const localBinPathSegments = ["node_modules", "@nanoforge-dev", "cli", "dist"];

export const localBinExists = () => {
  return existsSync(join(process.cwd(), ...localBinPathSegments));
};

// ESM import() needs a file:// URL: a raw C:\ path is rejected on Windows.
export const getLocalBinCommandLoaderUrl = (
  cwd = process.cwd(),
  windows = process.platform === "win32",
) => {
  const path = (windows ? win32 : posix).join(cwd, ...localBinPathSegments, "command.loader.js");
  return pathToFileURL(path, { windows }).href;
};

export const loadLocalBinCommandLoader = async (): Promise<typeof CommandLoader> => {
  const commandsFile = await import(getLocalBinCommandLoaderUrl());
  return commandsFile.CommandLoader;
};
