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
  shims = format.includes("cjs"),
  cjsInterop = format.includes("cjs"),
  minify = false,
  terserOptions = {
    mangle: false,
    keep_classnames: true,
    keep_fnames: true,
  },
  splitting = false,
  keepNames = true,
  dts = true,
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
    shims,
    cjsInterop,
    minify,
    terserOptions,
    splitting,
    keepNames,
    dts,
    sourcemap,
    esbuildPlugins,
    treeshake,
    outDir,
  });
}

export default [
  createTsupConfig({ dts: false, sourcemap: false }),
  createTsupConfig({ entry: ["src/command/command.loader.ts"] }),
];
