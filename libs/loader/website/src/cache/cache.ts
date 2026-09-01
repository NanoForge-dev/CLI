import { FileSystemManager } from "../file-system";
import { isManifestUpToDate } from "../manifest";
import {
  type IExtendedManifest,
  type IExtendedManifestFile,
  type IManifest,
  type IManifestFile,
} from "../types/manifest.type";
import { Logger } from "../utils/logger.utils";
import { setVersion } from "../version";
import { setLoadingStatus, setLoadingTotalFiles } from "../window";

const CACHE_LOCK_NAME = "nanoforge-game-cache";

async function withCacheLock<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator === "undefined" || !navigator.locks) return fn();
  return await navigator.locks.request(CACHE_LOCK_NAME, fn);
}

export class GameCache {
  private readonly logger: Logger = new Logger("Cache");
  private readonly fs: FileSystemManager = new FileSystemManager("game");

  async updateCache(manifest: IManifest, force = false): Promise<IExtendedManifest> {
    this.logger.info("Starting cache game files");

    let extendedManifest = await this._tryReuseCache(manifest, force);

    if (!extendedManifest) {
      extendedManifest = await withCacheLock(async () => {
        return (
          (await this._tryReuseCache(manifest, force)) ?? (await this._updateCacheProcess(manifest))
        );
      });
    }

    setVersion(manifest.version);
    this.logger.info("Game files cached");
    return extendedManifest;
  }

  private async _tryReuseCache(
    manifest: IManifest,
    force: boolean,
  ): Promise<IExtendedManifest | undefined> {
    if (force || !isManifestUpToDate(manifest)) return undefined;
    return this._parseCache(manifest);
  }

  private async _updateCacheProcess(manifest: IManifest): Promise<IExtendedManifest> {
    setLoadingStatus("Cleaning cache game files");
    const directory = await this.fs.getDirectory();
    await directory.clear();
    return {
      files: await this._updateCacheFiles(manifest.files),
    };
  }

  private async _updateCacheFiles(files: IManifestFile[]): Promise<IExtendedManifestFile[]> {
    const res = [];
    setLoadingTotalFiles(files.length);
    for (const [i, file] of files.entries()) {
      setLoadingStatus(`Download: ${file.path.replace(/^\/+/, "")}`, i);
      res.push(await this._updateCacheFile(file));
    }
    return res;
  }

  private async _updateCacheFile(fileManifest: IManifestFile): Promise<IExtendedManifestFile> {
    const res = await fetch(`/game/${fileManifest.path.replace(/^\/+/, "")}`);

    if (!res.ok) {
      let errorMessage: string;
      try {
        const errorData = await res.json();

        if (errorData.path) {
          errorMessage = `${errorData.error} : ${errorData.path}`;
        } else {
          errorMessage = errorData.error || `HTTP Error ${res.status}`;
        }
      } catch {
        errorMessage = `HTTP Error ${res.status} on file ${fileManifest.path}`;
      }
      throw new Error(errorMessage);
    }

    const file = await this.fs.getFile(fileManifest.path);

    const writable = await file.getWritable();
    await writable.write(await res.arrayBuffer());
    await writable.close();

    return {
      ...fileManifest,
      localPath: await file.getUrl(),
    };
  }

  private async _parseCache(manifest: IManifest): Promise<IExtendedManifest | undefined> {
    setLoadingStatus("Verifying application integrity");
    return this._parseFiles(manifest.files);
  }

  private async _parseFiles(files: IManifestFile[]): Promise<IExtendedManifest | undefined> {
    const res = [];
    for (const file of files) {
      const r = await this._parseFile(file);
      if (!r) return undefined;
      res.push(r);
    }
    return {
      files: res,
    };
  }

  /**
   * @todo Function to verify if the file passed in parameters exist
   * @todo Verify if the file passed in parameters is really complete
   */
  private async _parseFile(
    fileManifest: IManifestFile,
  ): Promise<IExtendedManifestFile | undefined> {
    try {
      const file = await this.fs.getFile(fileManifest.path);
      return {
        ...fileManifest,
        localPath: await file.getUrl(),
      };
    } catch {
      return undefined;
    }
  }
}
