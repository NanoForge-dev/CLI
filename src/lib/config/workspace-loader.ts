import type { ClientConfig, ServerConfig } from "@nanoforge-dev/config";
import { join } from "node:path";

import type { WorkspaceConfig } from "./workspace-config.types";

export interface ResolvedProject {
  directory: string;
  config: ClientConfig | ServerConfig;
}

export const resolveProjects = (
  workspace: WorkspaceConfig,
  baseDirectory: string,
): ResolvedProject[] => {
  if (workspace.type === "project") {
    return [{ directory: baseDirectory, config: workspace.config }];
  }

  return Object.entries(workspace.projects)
    .filter(
      (entry): entry is [string, Extract<(typeof entry)[1], { type: "project" }>] =>
        entry[1].type === "project",
    )
    .map(([relativePath, project]) => ({
      directory: join(baseDirectory, relativePath),
      config: project.config,
    }));
};
