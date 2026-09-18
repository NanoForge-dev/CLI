import { defineConfig } from "nanoforge/config";

export default defineConfig({
  type: "<%= part %>",
  entryFile: "src/main.js",<% if (libs.length) { %>
  editor: {
    entryFile: "src/main.js",
  },
});
