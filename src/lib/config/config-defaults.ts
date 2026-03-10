import { type Config } from "./config.type";

export const CONFIG_DEFAULTS: Config = {
  name: "nanoforge-app",
  language: "ts",
  initFunctions: true,
  client: {
    port: "3000",
    build: {
      entryFile: "client/main.ts",
      outDir: ".nanoforge/client",
    },
    runtime: {
      dir: ".nanoforge/client",
    },
  },
  server: {
    enable: false,
    build: {
      entryFile: "server/main.ts",
      outDir: ".nanoforge/server",
    },
    runtime: {
      dir: ".nanoforge/server",
    },
  },
};
