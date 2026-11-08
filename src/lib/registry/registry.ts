import { RegistryClient } from "@nanoforge-dev/registry";
import { basename } from "node:path";

import { GLOBAL_CONFIG_FILE_NAME, NANOFORGE_DIR, REGISTRY_URL } from "@lib/constants";
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
const IGNORED_FOLDERS = new Set([".git", "node_modules", "nf_modules", NANOFORGE_DIR]);
/** Files that hold secrets: env files, package manager and login credentials, keys. */
const IGNORED_FILES = [/^\.env/, /^\.npmrc$/, /^\.netrc$/, /\.(pem|key)$/, /^id_(rsa|ed25519)/];
/** Build output at the root, packed only when the manifest points into it. */
const BUILD_FOLDER = "dist";

/** The paths a manifest names (contents, sub-manifests, readme, a plugin's entry). */
const manifestPaths = (manifest: Record<string, unknown>): string[] => {
  const strings = (value: unknown): string[] =>
    typeof value === "string"
      ? [value]
      : Array.isArray(value)
        ? value.flatMap(strings)
        : typeof value === "object" && value !== null
          ? Object.values(value).flatMap(strings)
          : [];
  const contents = Array.isArray(manifest.contents)
    ? manifest.contents.map((entry: { path?: unknown }) => entry?.path)
    : [];
  return [contents, manifest.include, manifest.readme, manifest.entry].flatMap(strings);
};

/**
 * What `nf publish` leaves out, at any depth: secrets (`.env*`, `.npmrc`, `.netrc`, the
 * `.nanoforgerc` of `nf login --local`, which holds the registry key, `*.pem`, `*.key`, SSH keys),
 * and installed, version-control and `.nanoforge` folders; and `dist/` at the root, unless the
 * manifest points into it. `.gitignore` is not read.
 */
export const publishIgnore = (manifest: Record<string, unknown>) => {
  const packsBuild = manifestPaths(manifest).some((path) =>
    path.replace(/^\.\//, "").startsWith(`${BUILD_FOLDER}/`),
  );
  return (path: string, isDirectory: boolean): boolean => {
    if (isDirectory)
      return IGNORED_FOLDERS.has(basename(path)) || (path === BUILD_FOLDER && !packsBuild);
    const name = basename(path);
    return name === GLOBAL_CONFIG_FILE_NAME || IGNORED_FILES.some((pattern) => pattern.test(name));
  };
};
