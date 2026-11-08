# syntax=docker/dockerfile:1.7
#
# Khanya API (Express 5 + Prisma 7 + better-auth).
# Build context is the REPO ROOT (the pnpm workspace lockfile lives there):
#   build:
#     context: ./apps/khanya
#     dockerfile: api/Dockerfile
#
# One image, three jobs (change `command` in compose):
#   default                                  start the API
#   ./node_modules/.bin/prisma migrate deploy   apply migrations
#   ./node_modules/.bin/tsx prisma/seed.ts      load demo data (wipes content first!)

ARG NODE_VERSION=22
ARG PNPM_VERSION=12.14.0

FROM node:${NODE_VERSION}-alpine AS base
ARG PNPM_VERSION
RUN apk add --no-cache libc6-compat openssl wget \
 && npm install -g pnpm@${PNPM_VERSION}
WORKDIR /app

FROM base AS build
# Workspace manifests first so the dependency layer caches. Every workspace
# member's package.json must be present for --frozen-lockfile to validate.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/
COPY web/package.json ./web/
COPY api/prisma ./api/prisma
COPY api/prisma.config.ts ./api/
# `postinstall` runs `prisma generate`; prisma.config.ts requires DATABASE_URL to
# exist, so give that one command a placeholder (not stored in the image env).
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    pnpm install --frozen-lockfile --filter @khanya/api... --store-dir /pnpm/store

COPY api ./api
WORKDIR /app/api
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" ./node_modules/.bin/prisma generate \
 && pnpm build \
 # tsc only emits .ts files. Copy any non-TS files the generated Prisma client
 # needs at runtime (for example .wasm) next to the compiled output.
 && mkdir -p dist/generated \
 && tar -C src/generated --exclude='*.ts' -cf - . | tar -C dist/generated -xf - \
 && test -f dist/index.js

# --------------------------------------------------------------- runtime
# Built from the build stage on purpose: the Prisma CLI and tsx (dev
# dependencies) are needed for migrate and seed, and a demo does not need the
# last few hundred MB of image diet.
FROM build AS runtime
ENV NODE_ENV=production \
    API_PORT=4007
# The API resolves uploads relative to its working directory: /app/api/uploads.
RUN mkdir -p /app/api/uploads && chown -R node:node /app/api/uploads
USER node
EXPOSE 4007
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${API_PORT}/health" >/dev/null || exit 1
CMD ["node", "dist/index.js"]