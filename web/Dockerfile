# syntax=docker/dockerfile:1.7
#
# Khanya web (Next.js 16, App Router).
# Build context is the REPO ROOT:
#   build:
#     context: ./apps/khanya
#     dockerfile: web/Dockerfile
#
# The build needs outbound internet: next/font downloads the Google Fonts
# during `next build`.

ARG NODE_VERSION=22
ARG PNPM_VERSION=12.14.0

FROM node:${NODE_VERSION}-alpine AS base
ARG PNPM_VERSION
RUN apk add --no-cache libc6-compat \
 && npm install -g pnpm@${PNPM_VERSION}
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/
COPY web/package.json ./web/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @khanya/web... --store-dir /pnpm/store

COPY web ./web
WORKDIR /app/web

# Standalone output keeps the runtime image small. Idempotent: once
# `output: "standalone"` is committed in next.config.ts this does nothing.
RUN grep -q 'output:' next.config.ts \
 || sed -i 's|^const nextConfig: NextConfig = {|const nextConfig: NextConfig = {\n  output: "standalone",|' next.config.ts
RUN grep -q 'output: "standalone"' next.config.ts

# Fixed at build time:
#  - API_URL is baked into the rewrites (/api and /uploads proxy to the API).
#  - NEXT_PUBLIC_* are inlined by Next.js.
# Changing any of them means rebuilding the web image.
ARG API_URL="http://khanya-api:4007"
ARG NEXT_PUBLIC_SITE_URL="http://localhost:3007"
ARG NEXT_PUBLIC_WHATSAPP_NUMBER="27825550100"
ENV API_URL=${API_URL} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_PUBLIC_WHATSAPP_NUMBER=${NEXT_PUBLIC_WHATSAPP_NUMBER}

RUN pnpm build
# In a monorepo the standalone server lives at web/server.js. Fail loudly if not.
RUN test -f .next/standalone/web/server.js \
 || (echo "Unexpected standalone layout:" >&2; \
     find .next/standalone -maxdepth 3 -name server.js -not -path '*/node_modules/*' >&2; \
     exit 1)

# --------------------------------------------------------------- runner
FROM node:${NODE_VERSION}-alpine AS runner
RUN apk add --no-cache libc6-compat wget \
 && addgroup -g 1001 -S nodejs \
 && adduser -u 1001 -S nextjs -G nodejs

# sharp for next/image optimisation (standalone output does not include it).
# Isolated so it cannot disturb the traced node_modules.
RUN mkdir /opt/sharp && cd /opt/sharp \
 && npm init -y >/dev/null \
 && npm install --omit=dev sharp \
 && chown -R nextjs:nodejs /opt/sharp

WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_SHARP_PATH=/opt/sharp/node_modules/sharp \
    PORT=3007 \
    HOSTNAME=0.0.0.0

COPY --from=build --chown=nextjs:nodejs /app/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/web/.next/static ./web/.next/static
COPY --from=build --chown=nextjs:nodejs /app/web/public ./web/public

USER nextjs
EXPOSE 3007
# /robots.txt is static, so the check does not depend on the API being up.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/robots.txt" >/dev/null || exit 1
CMD ["node", "web/server.js"]