import { defineConfig } from "nanoforge/config";

export default defineConfig({
  type: "<%= part %>",
  entryFile: "src/main.js",<% if (libs.length) { %>
  libs: [<% libs.forEach(function (lib, i) { %>"<%= lib %>"<% if (i < libs.length - 1) { %>, <% } %><% }); %>],<% } %>
  editor: {
    entryFile: "src/main.js",
  },
});
