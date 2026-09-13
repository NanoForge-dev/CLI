import { defineConfig } from "nanoforge/config";

export default defineConfig({
  type: "<%= part %>",<% if (libs.length) { %>
  libs: [<% libs.forEach(function (lib, i) { %>"<%= lib %>"<% if (i < libs.length - 1) { %>, <% } %><% }); %>],<% } %>
});
