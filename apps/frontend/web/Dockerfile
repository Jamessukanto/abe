# Dependencies stage
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.12.0

# Copy package files
COPY apps/frontend/shared/package.json ./package.json
COPY apps/frontend/shared/pnpm-lock.yaml* ./pnpm-lock.yaml*
COPY apps/frontend/shared/packages/ui/package.json ./packages/ui/package.json
COPY apps/frontend/shared/packages/types/package.json ./packages/types/package.json
COPY apps/frontend/shared/packages/utils/package.json ./packages/utils/package.json
COPY apps/frontend/shared/packages/config/package.json ./packages/config/package.json
COPY apps/frontend/shared/package.json ./apps/frontend/shared/package.json
COPY apps/frontend/web/package.json ./apps/frontend/web/package.json

# Install dependencies
RUN pnpm install --frozen-lockfile

# Builder stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.12.0

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /app/packages/utils/node_modules ./packages/utils/node_modules
COPY --from=deps /app/packages/config/node_modules ./packages/config/node_modules
COPY --from=deps /app/apps/frontend/shared/node_modules ./apps/frontend/shared/node_modules
COPY --from=deps /app/apps/frontend/web/node_modules ./apps/frontend/web/node_modules

# Copy source code
COPY . .

# Build packages first
RUN pnpm build:shared

# Build the web app
WORKDIR /app/apps/frontend/web
RUN pnpm build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/frontend/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/web/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"] 