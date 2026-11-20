import fs from "fs";
import { dirname, join } from "path";

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

export const resetFolder = (folder: string) => {
  if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true, force: true });
  fs.mkdirSync(folder, { recursive: true });
};
