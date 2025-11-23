import { type Options, defineConfig } from "tsup";

function createTsupConfig({
  entry = ["src/bin/nf.ts"],
  external = [],
  noExternal = [],
  platform = "node",
  format = ["esm"],
  target = "esnext",
  skipNodeModulesBundle = true,
  clean = true,
  minify = false,
  terserOptions = {
    mangle: false,
    keep_classnames: true,
    keep_fnames: true,
  },
  splitting = false,
  keepNames = true,
  sourcemap = true,
  esbuildPlugins = [],
  treeshake = false,
  outDir = "dist",
}: Options = {}) {
  return defineConfig({
    entry,
    external,
    noExternal,
    platform,
    format,
    skipNodeModulesBundle,
    target,
    clean,
    minify,
    terserOptions,
    splitting,
    keepNames,
    sourcemap,
    esbuildPlugins,
    treeshake,
    outDir,
  });
}

export default [createTsupConfig()];
