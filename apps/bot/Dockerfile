FROM node:20-alpine AS base

# Base with turbo dependencies (we are using Alpine Linux)
FROM base AS libc6-base
RUN apk add --no-cache libc6-compat
RUN apk update

FROM libc6-base AS pruner
WORKDIR /app
RUN npm add -g turbo
COPY . .
 
# Generate a partial monorepo with a pruned lockfile for @mist/bot
RUN turbo prune @mist/bot --docker
 
# Add lockfile and package.json's of isolated subworkspace
FROM libc6-base AS builder
WORKDIR /app
 
# Install dev dependencies
COPY .gitignore .gitignore
COPY --from=pruner /app/out/json/ .
RUN corepack enable
RUN pnpm install
 
# Build the project
COPY --from=pruner /app/out/full/ .
RUN pnpm build --filter=@mist/bot...

# Prune dev dependencies
RUN pnpm prune --prod

FROM base AS runner
WORKDIR /app
 
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs
 
COPY --from=builder /app/ .
 
CMD node apps/bot/dist/main.js