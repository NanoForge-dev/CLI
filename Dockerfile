FROM node:25-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true

COPY . /usr/nanoforge
WORKDIR /usr/nanoforge

RUN npm --global install corepack@latest --force
RUN corepack enable

FROM base AS builder

RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm run build

FROM builder AS pruned

RUN pnpm --filter='@nanoforge-dev/cli' --prod deploy --legacy pruned

FROM node:25-alpine AS cli

WORKDIR /usr/nanoforge

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nanoforge
USER nanoforge

COPY --from=pruned /usr/nanoforge/pruned cli
COPY .cloud/docker/nf /usr/nanoforge

COPY .cloud/docker/docker-entrypoint.sh /usr/local/bin

ENV NANOFORGE_HOME="/usr/nanoforge"
ENV PATH="$NANOFORGE_HOME:$PATH"

ENTRYPOINT ["docker-entrypoint.sh"]

WORKDIR /app

CMD ["nf"]