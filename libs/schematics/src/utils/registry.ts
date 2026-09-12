import { MIN_RELEASE_AGE_HOURS } from "~/defaults";

const REGISTRY_URL = "https://registry.npmjs.org";
const DEFAULT_TIMEOUT_MS = 3000;

const RELEASE_VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

const compareVersions = (a: string, b: string): number => {
  const partsA = a.split(".").map(Number);
  const partsB = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
};

export interface FetchTrustedVersionOptions {
  /**
   * Only consider versions published at least this many hours ago, mirroring
   * pnpm's `minimumReleaseAge` supply-chain protection for a freshly
   * published (and potentially compromised) release.
   * @default MIN_RELEASE_AGE_HOURS
   */
  minAgeHours?: number;

  /**
   * Restrict candidates to this major version (e.g. `6` only considers
   * `6.x.x`). Useful to avoid silently jumping a generated project onto a
   * new major release.
   */
  major?: number;

  /** Network timeout in milliseconds. @default 3000 */
  timeoutMs?: number;
}

/**
 * Resolves the newest published version of an npm package that is at least
 * `minAgeHours` old, so freshly (and potentially maliciously) published
 * versions aren't picked up immediately. Falls back to `fallback` on any
 * network error, timeout, missing package, or when no version satisfies the
 * constraints, so callers never have to handle a rejected promise.
 */
export const fetchTrustedVersion = async (
  packageName: string,
  fallback: string,
  options: FetchTrustedVersionOptions = {},
): Promise<string> => {
  const { minAgeHours = MIN_RELEASE_AGE_HOURS, major, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${REGISTRY_URL}/${encodeURIComponent(packageName)}`, {
      signal: controller.signal,
    });
    if (!response.ok) {
      return fallback;
    }

    const data = (await response.json()) as { time?: Record<string, string> };
    const time = data.time;
    if (!time) {
      return fallback;
    }

    const cutoff = Date.now() - minAgeHours * 60 * 60 * 1000;
    const eligible = Object.entries(time)
      .filter(([version]) => RELEASE_VERSION_PATTERN.test(version))
      .filter(([version]) => major === undefined || Number(version.split(".")[0]) === major)
      .filter(([, publishedAt]) => new Date(publishedAt).getTime() <= cutoff)
      .map(([version]) => version)
      .sort(compareVersions);

    return eligible.at(-1) ?? fallback;
  } catch {
    return fallback;
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * Resolves several packages' trusted versions in parallel. Keys of `specs`
 * are the package name to query the registry for; values are the fallback
 * to use if that lookup fails. Returns a map from the *same* keys to the
 * resolved (or fallback) version — typed so callers don't get `| undefined`
 * back for a key they just passed in.
 */
export const fetchTrustedVersions = async <
  T extends Record<string, { fallback: string; major?: number }>,
>(
  specs: T,
): Promise<{ [K in keyof T]: string }> => {
  const entries = await Promise.all(
    Object.entries(specs).map(async ([packageName, { fallback, major }]) => {
      const version = await fetchTrustedVersion(packageName, fallback, { major });
      return [packageName, version] as const;
    }),
  );
  return Object.fromEntries(entries) as { [K in keyof T]: string };
};
