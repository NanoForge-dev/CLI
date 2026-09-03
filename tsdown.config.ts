import dotenv from "dotenv";
import { resolve } from "path";
import { type UserConfig, defineConfig } from "tsdown";

function createTsdownConfig({
  entry,
  outDir = "dist",
  format = ["esm"],
  shims = true,
  dts = true,
  sourcemap = true,
}: UserConfig = {}) {
  return defineConfig({
    entry,
    outDir,
    format,
    shims,
    dts,
    sourcemap,
    fixedExtension: false,
    platform: "node",
    target: "esnext",
    treeshake: false,
    // No `deps.neverBundle: true` here: it externalizes anything matching tsdown's
    // npm-package-specifier heuristic, which our `@lib/*` and `@utils/*` path aliases
    // match too, leaving them as unresolvable imports in the built output.
    env: dotenv.config({
      path: resolve(
        process.cwd(),
        process.env.NODE_ENV === "development" ? ".env.build.local" : ".env.build",
      ),
    }).parsed,
  });
}

export default [
  createTsdownConfig({ entry: ["src/bin/nf.ts"], dts: false, sourcemap: false }),
  createTsdownConfig({ entry: ["src/command/command.loader.ts"] }),
];
