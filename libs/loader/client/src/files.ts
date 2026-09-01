import { readdir } from "node:fs/promises";

import { MANIFEST } from "./server";

export const updateFiles = (dir: string) => {
  return addPath(dir, "");
};

const addPath = async (path: string, exportedPath: string) => {
  try {
    if ((await Bun.file(path).stat()).isDirectory()) {
      for (const file of await readdir(path)) {
        await addPath(`${path}/${file}`, `${exportedPath}/${file}`);
      }
      return;
    }
    MANIFEST.files.push({
      path: exportedPath,
    });
  } catch (e) {
    console.error(e);
  }
};
