import { type UserConfig, defineConfig } from "tsdown";

function createTsdownConfig({
  entry = ["src/index.ts"],
  outDir = "dist",
  format = ["esm", "cjs"],
  shims = true,
}: UserConfig = {}) {
  return defineConfig({
    entry,
    outDir,
    format,
    shims,
    dts: true,
    fixedExtension: false,
    platform: "node",
    sourcemap: true,
    target: "esnext",
    treeshake: false,
    deps: {
      skipNodeModulesBundle: true,
    },
  });
}

function createLibTsdownConfig(name: string) {
  return createTsdownConfig({
    entry: [`src/libs/${name}/${name}.factory.ts`],
    outDir: `dist/libs/${name}`,
    format: ["esm"],
    shims: false,
  });
}

export default [
  createTsdownConfig(),
  createLibTsdownConfig("application"),
  createLibTsdownConfig("configuration"),
  createLibTsdownConfig("part-base"),
  createLibTsdownConfig("part-main"),
  createLibTsdownConfig("docker"),
  createLibTsdownConfig("component"),
  createLibTsdownConfig("system"),
];
