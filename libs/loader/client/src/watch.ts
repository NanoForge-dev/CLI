import { watch } from "fs";

import { MANIFEST } from "./server";

export const startWatch = (gameDir: string, port?: string, serverGameDir?: string) => {
  const server = Bun.serve({
    port: port ?? 0,
    fetch(req, server) {
      server.upgrade(req);
    },
    websocket: {
      message(ws) {
        ws.send("not allowed");
      },
      open(ws) {
        ws.subscribe("watch");
      },
      close(ws) {
        ws.unsubscribe("watch");
      },
    },
  });

  MANIFEST.watch = {
    enable: true,
    url: server.url.toString(),
  };

  let lastCall = Date.now();

  const onClientWatch = () => {
    if (lastCall + 100 > Date.now()) return;
    lastCall = Date.now();
    server.publish("watch", "update");
    console.log(`[Watcher] Game client triggered an updated`);
  };

  const onServerWatch = () => {
    if (lastCall + 100 > Date.now()) return;
    lastCall = Date.now();
    setTimeout(() => {
      server.publish("watch", "update");
      console.log(`[Watcher] Game server triggered an updated`);
    }, 100);
  };

  watch(gameDir, { recursive: true }, onClientWatch);
  if (serverGameDir) watch(serverGameDir, { recursive: true }, onServerWatch);

  console.log(`Watcher started on url ${server.url.toString()}`);
};
