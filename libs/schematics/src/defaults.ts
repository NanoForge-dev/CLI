export const DEFAULT_APP_NAME = "nanoforge-app";
export const DEFAULT_LANGUAGE = "ts";
export const DEFAULT_PACKAGE_MANAGER = "npm";
export const DEFAULT_NANOFORGE_DEPENDENCY_VERSION = "^2";
export const DEFAULT_ENGINE_VERSION = "^2";

/** Fallback used when the registry lookup for `@nanoforge-dev/cli` fails. */
export const DEFAULT_CLI_DEPENDENCY_VERSION = "latest";

/**
 * Fallback used when the registry lookup for `typescript` fails. A specific
 * version, not a range — non-nanoforge packages are pinned exactly.
 */
export const DEFAULT_TYPESCRIPT_VERSION = "6.0.3";

/**
 * Mirrors pnpm's own `minimumReleaseAge` supply-chain protection: when
 * resolving a pinned dependency version at generation time, only consider
 * versions published at least this long ago, so a freshly (and potentially
 * maliciously) published release isn't picked up immediately.
 */
export const MIN_RELEASE_AGE_HOURS = 48;
