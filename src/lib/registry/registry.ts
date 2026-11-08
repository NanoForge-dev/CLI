import { RegistryClient } from "@nanoforge-dev/registry";
import { basename } from "node:path";

import { GLOBAL_CONFIG_FILE_NAME, REGISTRY_URL } from "@lib/constants";
import { GlobalConfigHandler } from "@lib/global-config";

import { RegistryAuthenticationError } from "@utils/errors";

/** The registry, with `apiKey` sent to it (and only to it) when given. */
export const createRegistry = (apiKey?: string): RegistryClient =>
  new RegistryClient({
    baseUrl: REGISTRY_URL,
    headers: (): Record<string, string> => (apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
  });

/** The registry with the key `nf login` saved for `directory`; refuses without one. */
export const createAuthenticatedRegistry = (directory: string): RegistryClient => {
  const { apiKey } = GlobalConfigHandler.read(directory);
  if (!apiKey) throw new RegistryAuthenticationError();
  return createRegistry(apiKey);
};

/** Folders never packed by `nf publish`, wherever they are. */
const IGNORED_FOLDERS = new Set([".git", "node_modules", "nf_modules"]);

/**
 * What `nf publish` leaves out: secrets (`.env*`, the `.nanoforgerc` of `nf login --local`, which
 * holds the registry key) and installed or version-control folders, at any depth.
 */
export const isIgnoredWhenPublishing = (path: string, isDirectory: boolean): boolean => {
  const name = basename(path);
  if (isDirectory) return IGNORED_FOLDERS.has(name);
  return name === ".env" || name.startsWith(".env.") || name === GLOBAL_CONFIG_FILE_NAME;
};
