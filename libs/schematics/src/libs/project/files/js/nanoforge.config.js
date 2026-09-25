import { defineConfig } from "@nanoforge-dev/config";

export default defineConfig({
  type: "<%= part %>",
  entryFile: "src/main.js",
  editor: {
    entryFile: "src/main.js",
  },
  language: "js",
});
