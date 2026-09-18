import type {
  ClientConfig,
  LibConfig as NfLibConfig,
  WorkspaceConfig as NfWorkspaceConfig,
  ServerConfig,
} from "@nanoforge-dev/config";

export interface ProjectConfig {
  type: "project";
  config: ClientConfig | ServerConfig;
}

export interface LibConfig {
  type: "lib";
  config: NfLibConfig;
}

export interface BaseWorkspaceConfig {
  type: "workspace";
  config: NfWorkspaceConfig;
  projects: Record<string, ProjectConfig | LibConfig>;
}

export type WorkspaceConfig = ProjectConfig | BaseWorkspaceConfig;
