import fs from "fs";
import { join } from "path";

import { GlobalConfigHandler } from "@lib/global-config";
import { type Repository, withAuth } from "@lib/http";
import { type FullManifest, type Manifest } from "@lib/manifest";

import { CLIError } from "@utils/errors";
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

  static async install(manifests: FullManifest[], dir: string): Promise<void> {
    const cwd = getCwd(dir);
    const client = this._getClient(dir, false);
    for (const manifest of manifests) {
      await this.installPackage(client, manifest, cwd);
    }
  }

  private static async installPackage(
    client: Repository,
    manifest: FullManifest,
    dir: string,
  ): Promise<void> {
    const file = await client.getFile(`/registry/${manifest.name}/-/${manifest._file}`);
    const path = join(dir, this.getTypeSubFolder(manifest.type));
    fs.mkdirSync(path, { recursive: true });
    fs.writeFileSync(join(path, manifest._file), await file.bytes());
  }

  private static getTypeSubFolder(type: string): string {
    if (type === "component") return "components";
    if (type === "system") return "systems";
    return ".";
  }

  private static _getClient(dir?: string, force?: boolean, headers: boolean = true): Repository {
    const config = GlobalConfigHandler.read(dir);
    return withAuth(config.apiKey, force, !headers ? {} : undefined);
  }

  private static _getPackageFile(filename: string, dir?: string): Promise<Blob> {
    const path = join(getCwd(dir ?? "."), filename);
    if (!fs.existsSync(path))
      throw new CLIError(
        "Package not found, please specify path in the nanoforge.manifest.json : `publish.paths.package`!",
      );
    try {
      fs.accessSync(path, fs.constants.R_OK);
      return fs.openAsBlob(path);
    } catch {
      throw new CLIError("Cannot read package file, please verify your file permissions!");
    }
  }
}
