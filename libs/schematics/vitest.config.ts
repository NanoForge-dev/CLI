import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": resolve(__dirname, "src"),
      "@utils": resolve(__dirname, "src/utils"),
    },
  },
  test: {
    include: ["src/**/*.spec.ts"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.spec.ts",
        "src/libs/**/*",
        "**/*.{interface,type,d}.ts",
        "**/{interfaces,types}/*.ts",
        "**/{interfaces,types}.ts",
        "**/index.{js,ts}",
      ],
    },
  },
});
