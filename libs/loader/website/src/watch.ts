import { type IManifest } from "./types/manifest.type";
import { Logger } from "./utils/logger.utils";

export const runWatcher = (config: IManifest["watch"]) => {
  if (!config.enable) return;

  const logger = new Logger("Watch");

  const socket = new WebSocket(config.url);

  socket.addEventListener("message", (event) => {
    if (!event.data || event.data !== "update") return;
    logger.info("Update received ! Reloading...");
    window.location.reload();
  });

  logger.info("Connected to watcher");
};
