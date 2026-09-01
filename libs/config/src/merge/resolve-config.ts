import {
  defaultClientConfig,
  defaultLibConfig,
  defaultServerConfig,
  defaultWorkspaceConfig,
} from "../defaults/default-configs";
import type {
  ClientConfig,
  LibConfig,
  NanoforgeConfig,
  ServerConfig,
  WorkspaceConfig,
} from "../types";
import { deepMerge } from "./deep-merge";

export const resolveWorkspaceConfig = (config: WorkspaceConfig): WorkspaceConfig => ({
  ...deepMerge(defaultWorkspaceConfig, config),
  type: "workspace",
});

export const resolveLibConfig = (config: LibConfig): LibConfig => ({
  ...deepMerge(defaultLibConfig, config),
  type: "lib",
});

export const resolveClientConfig = (config: ClientConfig): ClientConfig => ({
  ...deepMerge(defaultClientConfig, config),
  type: "client",
});

export const resolveServerConfig = (config: ServerConfig): ServerConfig => ({
  ...deepMerge(defaultServerConfig, config),
  type: "server",
});

/**
 * Merges a `nanoforge.config.ts` config against the defaults matching its
 * `type`.
 */
export const resolveConfig = (config: NanoforgeConfig): NanoforgeConfig => {
  switch (config.type) {
    case "workspace":
      return resolveWorkspaceConfig(config);
    case "lib":
      return resolveLibConfig(config);
    case "client":
      return resolveClientConfig(config);
    case "server":
      return resolveServerConfig(config);
  }
};
