import fs from "fs";
import { join } from "path";

import { GlobalConfigHandler } from "@lib/global-config";
import { type Repository, withAuth } from "@lib/http";
import { type Manifest } from "@lib/manifest";

import { getCwd } from "@utils/path";

export class Registry {
  static async publish(manifest: Manifest, dir?: string): Promise<void> {
    const client = this._getClient(dir, true, false);
    const filename = manifest.publish?.paths?.package ?? "index.ts";
    const file = await this._getPackageFile(filename, dir);

    const data = new FormData();
    for (const key of Object.keys(manifest)) {
      const value = manifest[key as keyof Manifest];
      if (!value) continue;
      data.append(key, typeof value === "string" ? value : JSON.stringify(value));
    }
    data.append("_packageFile", file, filename);
    await client.put(`/registry/${manifest.name}`, data);
  }

  static async unpublish(manifest: Manifest, dir?: string): Promise<void> {
    const client = this._getClient(dir, true);

    await client.delete(`/registry/${manifest.name}`);
  }

  private static _getClient(dir?: string, force?: boolean, headers: boolean = true): Repository {
    const config = GlobalConfigHandler.read(dir);
    return withAuth(config.apiKey ?? undefined, force, !headers ? {} : undefined);
  }

  private static _getPackageFile(filename: string, dir?: string): Promise<Blob> {
    const path = join(getCwd(dir ?? "."), filename);
    if (!fs.existsSync(path))
      throw new Error(
        "Package not found, please specify path in the nanoforge.manifest.json : `publish.paths.components`!",
      );
    try {
      fs.accessSync(path, fs.constants.R_OK);
      return fs.openAsBlob(path);
    } catch {
      throw new Error("Cannot read package file, please verify your file permissions!");
    }
  }
}
