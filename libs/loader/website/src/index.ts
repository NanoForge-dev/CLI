import { GameCache } from "./cache/cache";
import { getEnv } from "./env";
import { runGame } from "./game";
import { loadGameFiles } from "./loader";
import { getManifest } from "./manifest";
import { Logger } from "./utils/logger.utils";
import { runWatcher } from "./watch";
import { setError, setLoadingStatus } from "./window";

const logger = new Logger("Loader");

const runLoad = async () => {
  logger.info("Starting loading game");
  if (!window.isSecureContext) {
    throw new Error(
      "Storage issue: The game must be hosted with SSL (HTTPS) to enable local storage and load properly.",
    );
  }

  const manifest = await getManifest();
  runWatcher(manifest.watch);
  const cache = new GameCache();
  const extendedManifest = await cache.updateCache(manifest);
  const [files, mainModule] = await loadGameFiles(extendedManifest);
  const env = await getEnv();
  setLoadingStatus("Starting game");
  runGame(mainModule, { files, env });
};

window.addEventListener("error", (event) => {
  setError(event.error || event.message);
  logger.error(`Runtime error : ${event.message}`);
});

window.addEventListener("unhandledrejection", (event) => {
  setError(event.reason);
  logger.error(`Unhandled promise rejection : ${event.reason}`);
});

runLoad()
  .then(() => {
    logger.info("Game loaded !");
  })
  .catch((e) => {
    setError(e);
    logger.error(`Failed to load game : ${e}`);
  });
