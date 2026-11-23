import fs from "fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "path";

import { FileSystemError } from "@utils/errors";

export const copyFiles = (from: string, to: string) => {
  if (!fs.existsSync(from)) return;
  if (!fs.existsSync(to)) throw new FileSystemError("directory not found", to);
  fs.readdirSync(from, { recursive: true }).forEach((file) => {
    const name = file.toString();
    const source = join(from, name);
    if (fs.statSync(source).isDirectory()) return;
    const destination = join(to, name);
    fs.mkdirSync(dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  });
};

/**
 * Deletes `folder` and creates it again empty. Its direct children named in `keep` survive
 * (another target's output nested inside this one).
 */
export const resetFolder = (folder: string, keep: string[] = []) => {
  if (keep.length > 0 && fs.existsSync(folder) && fs.lstatSync(folder).isDirectory())
    fs.readdirSync(folder)
      .filter((name) => !keep.includes(name))
      .forEach((name) => fs.rmSync(join(folder, name), { recursive: true, force: true }));
  else if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true, force: true });
  fs.mkdirSync(folder, { recursive: true });
};

const isWithin = (parent: string, child: string): boolean => {
  const path = relative(parent, child);
  return path === "" || (path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path));
};

/**
 * Why emptying `outDir` (relative to `directory`) would destroy sources, or `undefined` when
 * it is safe: it must be relative, strictly inside `root`, and neither contain nor sit
 * inside one of `sources` (paths relative to `directory`).
 */
export const getUnsafeOutDirReason = (
  root: string,
  directory: string,
  outDir: string,
  sources: string[],
): string | undefined => {
  if (isAbsolute(outDir)) return "it must be a path relative to the project folder";
  const out = resolve(directory, outDir);
  if (isWithin(out, root)) return `it is the project folder or one of its parents (${root})`;
  if (!isWithin(root, out)) return `it is outside the project folder (${root})`;
  const source = sources
    .map((path) => resolve(directory, path))
    .find((path) => isWithin(out, path) || isWithin(path, out));
  return source ? `it overlaps the sources at ${source}` : undefined;
};
