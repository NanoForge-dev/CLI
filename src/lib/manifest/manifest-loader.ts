import { ItemManifest, MANIFEST_FILE } from "@nanoforge-dev/registry";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { ManifestError } from "@utils/errors";

/** The `nanoforge.manifest.json` of a package folder, checked against the registry's schema. */
export const loadManifest = (directory: string): ItemManifest => {
  const path = join(directory, MANIFEST_FILE);
  if (!existsSync(path))
    throw new ManifestError(`No manifest file found in directory: ${directory}`);
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    throw new ManifestError(`Unable to read or parse file at ${path}`);
  }
  const parsed = ItemManifest.safeParse(json);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new ManifestError(
      `Validation failed: ${issue?.path.join(".") || "manifest"}: ${issue?.message ?? "invalid"}`,
    );
  }
  return parsed.data;
};
