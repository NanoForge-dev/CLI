<% if (packageManager === 'bun') { %>FROM oven/bun:1.3<% } else { %>FROM node:25-slim<% } %>
<% if (packageManager === 'pnpm') { %>
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm
<% } %><% if (packageManager === 'yarn') { %>
RUN npm install -g yarn
<% } %>
WORKDIR /app

COPY package.json ./
<% if (packageManager === 'npm') { %>COPY package-lock.json ./
<% } else if (packageManager === 'yarn') { %>COPY yarn.lock ./
<% } else if (packageManager === 'pnpm') { %>COPY pnpm-lock.yaml ./
<% } else if (packageManager === 'bun') { %>COPY bun.lock ./
<% } %>
<% if (packageManager === 'npm') { %>RUN npm install --no-lockfile
<% } else if (packageManager === 'pnpm') { %>RUN pnpm install --frozen-lockfile --allow-build=bun
<% } else { %>RUN <%= packageManager %> install --frozen-lockfile
<% } %>
COPY . .

RUN <%= packageManager %> run build

CMD ["<%= packageManager %>", "run", "start"]
