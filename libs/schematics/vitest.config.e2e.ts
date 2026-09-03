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
    include: ["e2e/**/*.test.ts"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      include: ["dist/**/*.js"],
      exclude: ["dist/libs/**/files/**/*", "**/index.js"],
    },
  },
});
