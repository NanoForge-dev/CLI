import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": resolve(__dirname, "src"),
      "@utils": resolve(__dirname, "src/lib/utils"),
      "@lib": resolve(__dirname, "src/lib"),
    },
  },
  test: {
    include: ["e2e/**/*.test.ts"],
    passWithNoTests: true,
  },
});
