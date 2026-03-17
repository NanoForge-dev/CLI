import { type Config } from "./config.type";

export const CONFIG_DEFAULTS: Config = {
  name: "nanoforge-app",
  language: "ts",
  initFunctions: true,
  client: {
    enable: true,
    port: "3000",
    outDir: ".nanoforge/client",
    build: {
      entry: "client/main.ts",
    },
    editor: {
      entry: ".nanoforge/editor/client/main.ts",
      save: ".nanoforge/client.save.json",
    },
  },
  server: {
    enable: false,
    outDir: ".nanoforge/server",
    build: {
      entry: "server/main.ts",
    },
    editor: {
      entry: ".nanoforge/editor/server/main.ts",
      save: ".nanoforge/server.save.json",
    },
  },
};
