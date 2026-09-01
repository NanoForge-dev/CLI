import { IDS } from "../ids";
import { type IGameOptions } from "../types/game.type";
import { getElementById } from "../utils/document.utils";
import { Logger } from "../utils/logger.utils";
import { changeWindowToGame } from "../window";

const logger = new Logger("Game");

export const runGame = (mainModule: any, options: Omit<IGameOptions, "container">) => {
  logger.info("Starting game");
  changeWindowToGame();
  mainModule.main({
    ...options,
    container: getElementById(IDS.container) as HTMLDivElement,
  });
  logger.info("Game started");
};
