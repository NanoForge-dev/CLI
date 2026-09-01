export const GAME_VERSION_SYMBOL = "game-version";

export const getVersion = (): string | null => {
  return localStorage.getItem(GAME_VERSION_SYMBOL);
};

export const setVersion = (version: string) => {
  localStorage.setItem(GAME_VERSION_SYMBOL, version);
};

export const clearVersion = () => {
  localStorage.removeItem(GAME_VERSION_SYMBOL);
};
