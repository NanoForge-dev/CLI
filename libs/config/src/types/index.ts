import type { ClientConfig } from "./client-config.type";
import type { LibConfig } from "./lib-config.type";
import type { ServerConfig } from "./server-config.type";
import type { WorkspaceConfig } from "./workspace-config.type";

export type { BaseConfig } from "./base-config.type";
export type { ClientConfig } from "./client-config.type";
export type { LibConfig } from "./lib-config.type";
export type { BuildableConfig, ContainLibConfig, SourceableConfig } from "./mixins.type";
export type { ServerConfig } from "./server-config.type";
export type { WorkspaceConfig } from "./workspace-config.type";

/** Discriminated union of every `nanoforge.config.ts` shape, keyed by `type`. */
export type NanoforgeConfig = WorkspaceConfig | LibConfig | ClientConfig | ServerConfig;
