import fs from "fs";
import { join } from "path";

export const copyFiles = (from: string, to: string) => {
  if (!fs.existsSync(from)) return;
  if (!fs.existsSync(to)) throw new Error(`Directory ${to} does not exist`);
  fs.readdirSync(from, { recursive: true }).forEach((file) => {
    fs.copyFileSync(join(from, file.toString()), join(to, file.toString()));
  });
};

export const resetFolder = (folder: string) => {
  if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true, force: true });
  fs.mkdirSync(folder, { recursive: true });
};
