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
import type { DeepRequired } from "../types/utils.type";
import { deepMerge } from "./deep-merge";

export const resolveWorkspaceConfig = (config: WorkspaceConfig): DeepRequired<WorkspaceConfig> => ({
  ...deepMerge(defaultWorkspaceConfig, config),
  type: "workspace",
});

export const resolveLibConfig = (config: LibConfig): DeepRequired<LibConfig> => ({
  ...deepMerge(defaultLibConfig, config),
  type: "lib",
});

export const resolveClientConfig = (config: ClientConfig): DeepRequired<ClientConfig> => ({
  ...deepMerge(defaultClientConfig, config),
  type: "client",
});

export const resolveServerConfig = (config: ServerConfig): DeepRequired<ServerConfig> => ({
  ...deepMerge(defaultServerConfig, config),
  type: "server",
});

/**
 * Merges a `nanoforge.config.ts` config against the defaults matching its
 * `type`.
 */
export const resolveConfig = (config: NanoforgeConfig): DeepRequired<NanoforgeConfig> => {
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
