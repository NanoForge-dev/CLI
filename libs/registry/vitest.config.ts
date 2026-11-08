import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.spec.ts"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "**/*.{interface,type,d}.ts",
        "**/{interfaces,types}/*.ts",
        "**/{interfaces,types}.ts",
        "**/index.{js,ts}",
      ],
    },
  },
});
