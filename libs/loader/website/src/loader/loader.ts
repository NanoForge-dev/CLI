import { type IGameOptions } from "../types/game.type";
import { type IExtendedManifest, type IExtendedManifestFile } from "../types/manifest.type";
import { addScript } from "../utils/document.utils";
import { Logger } from "../utils/logger.utils";

const logger = new Logger("Loader");

export const loadGameFiles = async (
  manifest: IExtendedManifest,
): Promise<[IGameOptions["files"], any]> => {
  const files = new Map<string, string>();
  let mainModule = undefined;
  logger.info("Starting load game files from cache");
  for (const file of manifest.files) {
    if (file.path === "/main.js") {
      const resModule = await loadScript(file);
      if (resModule) mainModule = resModule;
      continue;
    }
    files.set(file.path, file.localPath);
  }
  if (!mainModule) throw new Error("Could not find main function");
  logger.info("Game files loaded");
  return [files, mainModule];
};

const loadScript = async (file: IExtendedManifestFile): Promise<any | undefined> => {
  const res = await import(file.localPath);
  if (res["main"]) return res;
  addScript(file.localPath);
};
