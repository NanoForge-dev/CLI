import dotenv from "dotenv";
import { resolve } from "path";
import { type UserConfig, defineConfig } from "tsdown";

export function createTsdownLibConfig() {
  return defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",
    format: ["esm", "cjs"],
    shims: true,
    dts: true,
    sourcemap: true,
    clean: true,
    minify: true,
    fixedExtension: false,
    platform: "node",
    target: "esnext",
    treeshake: false,
    deps: {
      neverBundle: true,
    },
    outputOptions: {
      assetFileNames: "[name][extname]",
    },
  });
}

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
    deps: {
      neverBundle: true,
    },
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
