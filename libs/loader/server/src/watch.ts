import { watch } from "fs";

export const startWatch = (gameDir: string, onWatch: () => Promise<void>) => {
  let lastCall = Date.now();

  watch(gameDir, { recursive: true, persistent: false }, async () => {
    if (lastCall + 100 > Date.now()) return;
    lastCall = Date.now();
    console.log(`[Watcher] Game server triggered an updated`);
    await onWatch();
  });

  console.log(`Watcher started`);
};
