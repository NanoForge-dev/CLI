import type { ClientConfig, LibConfig, ServerConfig, WorkspaceConfig } from "../types";

export const defaultWorkspaceConfig: Omit<WorkspaceConfig, "type"> = {
  packages: [],
};

export const defaultLibConfig: Omit<LibConfig, "type"> = {
  dir: {
    assets: "assets",
    shared: "shared",

    components: "shared/components",
    systems: "shared/systems",
    scenes: "shared/scenes",
  },
};

export const defaultClientConfig: Omit<ClientConfig, "type"> = {
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

  libs: [],
};

export const defaultServerConfig: Omit<ServerConfig, "type"> = {
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

  libs: [],
};
