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

<% if (packageManager === "npm") { %>COPY package.json package-lock.json ./
RUN npm ci
<% } else if (packageManager === "yarn") { %>COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
<% } else if (packageManager === "pnpm") { %>COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
<% } else { %>COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
<% } %>
FROM deps AS build
COPY . .
RUN <%= packageManager %> run build

<% if (packageManager === "bun") { %>FROM oven/bun:1.3-slim<% } else { %>FROM base<% } %>
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/nanoforge.config.ts ./
<% if (part === "server") { %>
<% } %><% if (packageManager !== "pnpm") { %>
USER <% if (packageManager === "bun") { %>bun<% } else { %>node<% } %>
<% } %><% if (part === "client") { %>EXPOSE 3000
<% } %>CMD ["<%= packageManager %>", "run", "start"]
