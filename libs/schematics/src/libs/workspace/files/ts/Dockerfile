<% if (packageManager === "bun") { %>
FROM oven/bun:1.3 AS base
<% } else if (packageManager === "pnpm") { %>
FROM ghcr.io/pnpm/pnpm:12 AS base
RUN pnpm runtime set node 26 -g
<% } else { %>
FROM node:26-slim AS base
<% } %><% if (packageManager === "yarn") { %>
RUN npm install -g yarn
<% } %>
WORKDIR /app

FROM base AS deps
<% if (packageManager === "pnpm") { %>
COPY pnpm-lock.yaml ./
RUN pnpm fetch

FROM deps AS build
COPY . .
RUN pnpm install --frozen-lockfile --offline
<% } else if (packageManager === "npm") { %>
FROM deps AS build
COPY . .
RUN npm ci
<% } else { %>
FROM deps AS build
COPY . .
RUN <%= packageManager %> install --frozen-lockfile
<% } %>
RUN <%= packageManager %> run build

<% if (packageManager === "bun") { %>FROM oven/bun:1.3-slim<% } else { %>FROM base<% } %>
WORKDIR /app

COPY --from=build /app .
<% if (packageManager !== "pnpm") { %>
USER <% if (packageManager === "bun") { %>bun<% } else { %>node<% } %>
<% } %>EXPOSE 3000
CMD ["<%= packageManager %>", "run", "start"]
