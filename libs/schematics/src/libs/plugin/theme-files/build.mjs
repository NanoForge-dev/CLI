/**
 * The theme has no code: its build copies the manifest and the icons into dist/, the folder the
 * editor loads. With --watch, it copies them again on every change (the editor then reloads it).
 */
import { cpSync, existsSync, mkdirSync, rmSync, watch } from "node:fs";

const build = () => {
  rmSync("dist", { recursive: true, force: true });
  mkdirSync("dist");
  cpSync("nanoforge.manifest.json", "dist/nanoforge.manifest.json");
  if (existsSync("icons")) cpSync("icons", "dist/icons", { recursive: true });
  console.log("Built dist/");
};

build();
if (process.argv.includes("--watch")) {
  for (const target of ["nanoforge.manifest.json", "icons"])
    if (existsSync(target)) watch(target, { recursive: true }, build);
}
