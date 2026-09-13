import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchTrustedVersion, fetchTrustedVersions } from "./registry";

const HOUR = 60 * 60 * 1000;

const mockRegistryResponse = (time: Record<string, string>, ok = true) => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      json: () => Promise.resolve({ time }),
    }),
  );
};

describe("fetchTrustedVersion", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-10T00:00:00Z"));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("picks the newest version published at least 48h ago", async () => {
    mockRegistryResponse({
      created: "2020-01-01T00:00:00Z",
      modified: "2026-09-09T00:00:00Z",
      "1.0.0": new Date(Date.now() - 100 * HOUR).toISOString(),
      "1.1.0": new Date(Date.now() - 72 * HOUR).toISOString(),
      "1.2.0": new Date(Date.now() - 1 * HOUR).toISOString(), // too fresh
    });

    const version = await fetchTrustedVersion("some-pkg", "0.0.0");
    expect(version).toBe("1.1.0");
  });

  it("excludes prerelease and non-semver tags", async () => {
    mockRegistryResponse({
      "1.0.0": new Date(Date.now() - 100 * HOUR).toISOString(),
      "1.1.0-beta.1": new Date(Date.now() - 100 * HOUR).toISOString(),
    });

    const version = await fetchTrustedVersion("some-pkg", "0.0.0");
    expect(version).toBe("1.0.0");
  });

  it("restricts to a requested major version", async () => {
    mockRegistryResponse({
      "6.0.3": new Date(Date.now() - 100 * HOUR).toISOString(),
      "7.0.2": new Date(Date.now() - 100 * HOUR).toISOString(),
    });

    const version = await fetchTrustedVersion("typescript", "6.0.0", { major: 6 });
    expect(version).toBe("6.0.3");
  });

  it("falls back when every version is too fresh", async () => {
    mockRegistryResponse({
      "1.0.0": new Date(Date.now() - 1 * HOUR).toISOString(),
    });

    const version = await fetchTrustedVersion("some-pkg", "0.0.0");
    expect(version).toBe("0.0.0");
  });

  it("falls back when the registry response is not ok", async () => {
    mockRegistryResponse({}, false);
    const version = await fetchTrustedVersion("missing-pkg", "0.0.0");
    expect(version).toBe("0.0.0");
  });

  it("falls back when the fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const version = await fetchTrustedVersion("some-pkg", "0.0.0");
    expect(version).toBe("0.0.0");
  });
});

describe("fetchTrustedVersions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-10T00:00:00Z"));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("resolves multiple packages and keys the result by package name", async () => {
    mockRegistryResponse({
      "2.5.0": new Date(Date.now() - 100 * HOUR).toISOString(),
    });

    const versions = await fetchTrustedVersions({
      "pkg-a": { fallback: "0.0.0" },
      "pkg-b": { fallback: "0.0.1" },
    });

    expect(versions).toEqual({ "pkg-a": "2.5.0", "pkg-b": "2.5.0" });
  });
});
