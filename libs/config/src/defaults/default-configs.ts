import type { ClientConfig, LibConfig, ServerConfig, WorkspaceConfig } from "../types";
import type { DeepRequired } from "../types/utils.type";

export const defaultWorkspaceConfig: DeepRequired<Omit<WorkspaceConfig, "type">> = {
  packages: [],
};

export const defaultLibConfig: DeepRequired<Omit<LibConfig, "type">> = {
  dir: {
    assets: "assets",
    shared: "shared",

    components: "shared/components",
    systems: "shared/systems",
    scenes: "shared/scenes",
  },
};

export const defaultClientConfig: DeepRequired<Omit<ClientConfig, "type">> = {
  entryFile: "src/main.ts",
  out: {
    dir: "dist",
    mainFile: "main.js",
  },

  dir: {
    assets: "assets",
    packages: "nf_modules",

    components: "src/components",
    systems: "src/systems",
    scenes: "src/scenes",
  },

  editor: {
    entryFile: "src/main.ts",
  },

  port: "3000",
  tls: {
    enable: false,
  },

  libs: [],
};

export const defaultServerConfig: DeepRequired<Omit<ServerConfig, "type">> = {
  entryFile: "src/main.ts",
  out: {
    dir: "dist",
    mainFile: "main.js",
  },

  dir: {
    assets: "assets",
    packages: "nf_modules",

    components: "src/components",
    systems: "src/systems",
    scenes: "src/scenes",
  },

  editor: {
    entryFile: "src/main.ts",
  },

  libs: [],
};
