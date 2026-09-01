import { defineConfig } from "tsdown";

export default [
  defineConfig({
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
  }),
];
