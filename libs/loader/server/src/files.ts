import * as fs from "node:fs";
import { join } from "node:path";

const PATHS: [string, string][] = [];

export const getFiles = (basePath: string) => {
  addPath(basePath, "");
  return PATHS;
};

const addPath = (path: string, exportedPath: string) => {
  if (fs.statSync(path).isDirectory()) {
    fs.readdirSync(path).forEach((file) => {
      addPath(join(path, file), join(exportedPath, file));
    });
    return;
  }
  PATHS.push([`/${exportedPath}`, path]);
};
