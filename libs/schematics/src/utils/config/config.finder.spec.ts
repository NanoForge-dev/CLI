import { type Path } from "@angular-devkit/core";
import { type DirEntry, type Tree } from "@angular-devkit/schematics";
import { describe, expect, it, vi } from "vitest";

import { ConfigFinder } from "./config.finder";

function createMockDirEntry(
  path: string,
  subfiles: string[],
  parent: DirEntry | null = null,
): DirEntry {
  return {
    path: path as Path,
    subfiles: subfiles as any,
    subdirs: [] as any,
    parent,
    dir: vi.fn() as any,
    file: vi.fn() as any,
    visit: vi.fn() as any,
  };
}

function createMockTree(dirEntry: DirEntry): Tree {
  return {
    getDir: vi.fn().mockReturnValue(dirEntry),
  } as unknown as Tree;
}

describe("ConfigFinder", () => {
  it("should find nanoforge.config.json in the given directory", () => {
    const dir = createMockDirEntry("/project", ["nanoforge.config.json"]);
    const tree = createMockTree(dir);
    const finder = new ConfigFinder(tree);

    const result = finder.find("/project" as Path);

    expect(result).toBe("/project/nanoforge.config.json");
  });

  it("should search parent directories recursively", () => {
    const parent = createMockDirEntry("/", ["nanoforge.config.json"]);
    const child = createMockDirEntry("/project/src", [], parent);
    const tree = createMockTree(child);
    const finder = new ConfigFinder(tree);

    const result = finder.find("/project/src" as Path);

    expect(result).toBe("/nanoforge.config.json");
  });

  it("should return null when config is not found", () => {
    const root = createMockDirEntry("/", [], null);
    const child = createMockDirEntry("/project", [], root);
    const tree = createMockTree(child);
    const finder = new ConfigFinder(tree);

    const result = finder.find("/project" as Path);

    expect(result).toBeNull();
  });

  it("should ignore files that do not match nanoforge.config.json", () => {
    const root = createMockDirEntry("/", [], null);
    const dir = createMockDirEntry("/project", ["package.json", "tsconfig.json"], root);
    const tree = createMockTree(dir);
    const finder = new ConfigFinder(tree);

    const result = finder.find("/project" as Path);

    expect(result).toBeNull();
  });
});
