import {
  MANIFEST_FILE,
  RegistryClient,
  isInsidePath,
  readPackageContents,
} from "@nanoforge-dev/registry";
import { statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, dirname, join, normalize } from "node:path";

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
const DENIED_FOLDERS = new Set([
  ".git",
  "node_modules",
  "nf_modules",
  NANOFORGE_DIR,
  ".aws",
  ".docker",
]);
/** Files that hold secrets: env files, credentials, keys and keystores, private SSH keys. */
const DENIED_FILES = [
  /^\.env/,
  /^\.npmrc$/,
  /^\.netrc$/,
  /^\.git-credentials$/,
  /^\.pgpass$/,
  /^credentials\.json$/,
  /\.(pem|key|p12|pfx|keystore)$/,
  /^id_[a-z0-9_]+$/,
];
/** Files at the root packed with every package. */
const ROOT_FILES = /^(readme|license|licence|changelog)(\..*)?$/i;

const isDenied = (path: string, isDirectory: boolean): boolean => {
  const name = basename(path);
  if (isDirectory) return DENIED_FOLDERS.has(name);
  return name === GLOBAL_CONFIG_FILE_NAME || DENIED_FILES.some((pattern) => pattern.test(name));
};

/** Every string a value holds, at any depth. */
const strings = (value: unknown): string[] =>
  typeof value === "string"
    ? [value]
    : Array.isArray(value)
      ? value.flatMap(strings)
      : typeof value === "object" && value !== null
        ? Object.values(value).flatMap(strings)
        : [];

/** Every `path` field a value holds, at any depth (a plugin's `contributes`: icons…). */
const pathFields = (value: unknown): unknown[] =>
  Array.isArray(value)
    ? value.flatMap(pathFields)
    : typeof value === "object" && value !== null
      ? Object.entries(value).flatMap(([key, field]) =>
          key === "path" ? [field] : pathFields(field),
        )
      : [];

const readJson = async (file: string): Promise<unknown> =>
  JSON.parse(await readFile(file, "utf8")) as unknown;

/**
 * What the manifest names, from the package root: its `contents` and older `items`, its
 * sub-manifests (`include`) and their contents, its `readme`; for a plugin, the folder of each
 * `entry` file (a build puts its chunks, CSS and assets next to it) and the `path` fields of
 * `contributes`. Folders end with `/`.
 */
const namedPaths = async (root: string, manifest: Record<string, unknown>): Promise<string[]> => {
  const described = await readPackageContents(manifest, (path) => readJson(join(root, path)));
  const plugin = manifest.type === "plugin";
  const named = [
    MANIFEST_FILE,
    ...described.contents.map(({ path }) => path),
    ...described.manifests,
    ...pathFields(manifest.items).flatMap(strings),
    ...strings(manifest.readme),
    ...(plugin
      ? [
          ...strings(manifest.entry).map((entry) => `${dirname(normalize(entry))}/`),
          ...pathFields(manifest.contributes).flatMap(strings),
        ]
      : []),
  ];
  return named
    .map((path) => path.replace(/^\.\//, ""))
    .map((path) => (path === "./" ? "" : path))
    .filter((path) => path === "" || isInsidePath(path.replace(/\/$/, "")))
    .map((path) =>
      path === "" ||
      path.endsWith("/") ||
      !statSync(join(root, path), { throwIfNoEntry: false })?.isDirectory()
        ? path
        : `${path}/`,
    );
};

/**
 * What `nf publish` leaves out of the package at `root`. Only what the manifest names is packed
 * (see `namedPaths`), with the root's `README*`, `LICENSE*` and `CHANGELOG*`; inside that, secrets
 * (`.env*`, `.npmrc`, `.netrc`, `.git-credentials`, `.pgpass`, `credentials.json`, the
 * `.nanoforgerc` of `nf login --local`, `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.keystore`,
 * private SSH keys `id_*`) and `.git`, `node_modules`, `nf_modules`, `.nanoforge`, `.aws` and
 * `.docker` folders stay out at any depth. `.gitignore` is not read.
 */
export const publishIgnore = async (root: string, manifest: Record<string, unknown>) => {
  const named = await namedPaths(root, manifest);
  const folders = named.filter((path) => path === "" || path.endsWith("/"));
  const files = new Set(named.filter((path) => path !== "" && !path.endsWith("/")));
  const inFolder = (path: string) => folders.some((folder) => path.startsWith(folder));
  return (path: string, isDirectory: boolean): boolean => {
    if (isDenied(path, isDirectory)) return true;
    if (inFolder(isDirectory ? `${path}/` : path)) return false;
    if (isDirectory)
      return ![...folders, ...files].some((allowed) => allowed.startsWith(`${path}/`));
    return !files.has(path) && !(!path.includes("/") && ROOT_FILES.test(path));
  };
};
