import type { NanoforgeConfig } from "@nanoforge-dev/config";
import { existsSync, statSync } from "node:fs";
import { glob } from "node:fs/promises";
import { join } from "node:path";

import { CLIError, ConfigNotFoundError } from "@utils/errors";

import { loadConfig } from "./config-loader";
import type {
  BaseWorkspaceConfig,
  LibConfig,
  ProjectConfig,
  WorkspaceConfig,
} from "./workspace-config.types";

const resolvePackageConfig = async (
  packageDir: string,
): Promise<ProjectConfig | LibConfig | undefined> => {
  let config: NanoforgeConfig;
  try {
    config = await loadConfig(packageDir);
  } catch (error) {
    if (error instanceof ConfigNotFoundError) return undefined;
    throw error;
  }

  if (config.type === "workspace") {
    throw new CLIError(
      `Invalid config at '${packageDir}': a workspace package cannot itself be of type 'workspace'.`,
      "Nest projects and libs under the root workspace instead of another workspace.",
    );
  }

  return config.type === "lib" ? { type: "lib", config } : { type: "project", config };
};

const resolvePackagePattern = async (
  directory: string,
  pattern: string,
): Promise<Record<string, ProjectConfig | LibConfig>> => {
  const projects: Record<string, ProjectConfig | LibConfig> = {};

  for await (const relativePath of glob(pattern, { cwd: directory })) {
    const packageDir = join(directory, relativePath);
    if (!existsSync(packageDir) || !statSync(packageDir).isDirectory()) continue;

    const entry = await resolvePackageConfig(packageDir);
    if (entry) projects[relativePath] = entry;
  }

  if (Object.keys(projects).length === 0) {
    console.warn(
      `[nanoforge] No project or lib config found for workspace package pattern '${pattern}' in '${directory}'.`,
    );
  }

  return projects;
};

const parseBaseWorkspaceConfig = async (
  directory: string,
  config: Extract<NanoforgeConfig, { type: "workspace" }>,
): Promise<BaseWorkspaceConfig> => {
  const patterns = config.packages ?? [];

  const projects: Record<string, ProjectConfig | LibConfig> = {};
  for (const pattern of patterns) {
    Object.assign(projects, await resolvePackagePattern(directory, pattern));
  }

  return { type: "workspace", config, projects };
};

export const parseWorkspaceConfig = async (directory: string): Promise<WorkspaceConfig> => {
  const config = await loadConfig(directory);

  if (config.type === "lib") {
    throw new CLIError(
      `Invalid config at '${directory}': the root config cannot be of type 'lib'.`,
      "Use a 'workspace' or a 'client'/'server' project config at the root.",
    );
  }

  if (config.type === "workspace") return parseBaseWorkspaceConfig(directory, config);

  return { type: "project", config };
};
