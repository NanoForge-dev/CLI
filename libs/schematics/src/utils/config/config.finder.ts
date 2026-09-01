import { type Path, join } from "@angular-devkit/core";
import { type DirEntry, type Tree } from "@angular-devkit/schematics";

export interface FindOptions {
  path: Path;
}

export class ConfigFinder {
  constructor(private tree: Tree) {}

  public find(path: Path): Path | null {
    const dir = this.tree.getDir(path);
    return this.findIn(dir);
  }

  /**
   * Recursively searches for the module file in the given directory.
   *
   * @param directory - The directory to search in.
   * @returns The path to the module file, or null if not found.
   */
  private findIn(directory: DirEntry | null): Path | null {
    if (!directory) {
      return null;
    }
    const moduleFilename = directory.subfiles.find((filename) =>
      /^nanoforge.config.json$/.test(filename),
    );
    return moduleFilename !== undefined
      ? join(directory.path, moduleFilename.valueOf())
      : this.findIn(directory.parent);
  }
}
