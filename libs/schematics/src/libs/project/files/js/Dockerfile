# Standalone NanoForge <%= part %> app.
#   docker build -t <%= packageName %> .
#   docker run --rm --env-file .env<% if (part === "client") { %> -p 3000:3000<% } %> <%= packageName %>
<% if (packageManager === "bun") { %>
FROM oven/bun:1.3 AS base
<% } else if (packageManager === "pnpm") { %>
# ghcr.io/pnpm/pnpm ships only the pnpm binary (no Node.js) - `pnpm runtime set` provisions
# and pins the Node.js version pnpm itself runs commands with. See https://pnpm.io/docker.
FROM ghcr.io/pnpm/pnpm:12 AS base
RUN pnpm runtime set node 26 -g
<% } else { %>
FROM node:26-slim AS base
<% } %><% if (packageManager === "yarn") { %>
RUN npm install -g yarn
<% } %>
WORKDIR /app

FROM base AS deps

# Installed in its own layer so this only reruns when the manifest or lockfile changes,
# not on every source edit.
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

# node_modules is copied wholesale, dev dependencies included: the engine packages
# (nanoforge, @nanoforge-dev/*) that `<%= packageManager %> run start` needs at runtime
# are declared as devDependencies, not dependencies (see package.json).
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/assets ./assets
COPY --from=build /app/package.json ./
COPY --from=build /app/nanoforge.config.js ./
<% if (part === "server") { %>
# Server ports are read from the environment at startup (NANOFORGE_SERVER_*) -
# expose whichever ones your .env configures.
<% } %><% if (packageManager !== "pnpm") { %>
USER <% if (packageManager === "bun") { %>bun<% } else { %>node<% } %>
<% } %><% if (part === "client") { %>EXPOSE 3000
<% } %>CMD ["<%= packageManager %>", "run", "start"]
