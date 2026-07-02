# syntax=docker/dockerfile:1

# ---- deps: install dependencies only, cached separately from source changes ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: full source + deps, produces the standalone build ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# BASE_URL etc. are read server-side at request time (see lib/api-client.ts), never inlined
# into the client bundle — no build-time ARGs/ENV needed here, only at `docker run`.
RUN npm run build

# ---- runner: minimal runtime image ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Next's standalone output doesn't include public/ or .next/static — copy them in manually
# per Next.js's own documented pattern for this build mode.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
