import { Config } from "./config.type";

export const CONFIG_DEFAULTS: Config = {
  name: "nanoforge-app",
  language: "ts",
  initFunctions: true,
  client: {
    port: "3000",
    gameExposurePort: "3001",
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
    port: "3002",
    build: {
      entryFile: "server/main.ts",
      outDir: ".nanoforge/server",
    },
    runtime: {
      dir: ".nanoforge/server",
    },
  },
};
