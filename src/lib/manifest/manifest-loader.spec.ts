import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { ManifestError } from "@utils/errors";

import { loadManifest } from "./manifest-loader";

describe("loadManifest", () => {
  it("suggests a package folder when there is no manifest, not a syntax fix", () => {
    const directory = mkdtempSync(join(tmpdir(), "nf-manifest-"));

    const error = (() => {
      try {
        loadManifest(directory);
      } catch (caught) {
        return caught;
      }
    })();

    expect(error).toBeInstanceOf(ManifestError);
    expect((error as ManifestError).message).toContain("No manifest file found");
    expect((error as ManifestError).suggestion).toBe(
      "Run the command in a package folder, or pass it with -d.",
    );
  });

  it("keeps the syntax suggestion for a manifest that does not parse", () => {
    const directory = mkdtempSync(join(tmpdir(), "nf-manifest-"));
    writeFileSync(join(directory, "nanoforge.manifest.json"), "{ not json");

    expect(() => loadManifest(directory)).toThrow(
      expect.objectContaining({ suggestion: expect.stringContaining("syntax") }),
    );
  });
});
