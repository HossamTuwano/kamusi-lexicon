# Build stage: install all workspaces, compile shared packages + API
FROM node:20-alpine AS build

WORKDIR /app

# Manifests first so `npm ci` can link @kamusi/* workspaces locally
# (no public-registry lookups) and the layer caches cleanly.
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/core/package.json packages/core/package.json
COPY packages/database/package.json packages/database/package.json

RUN npm ci --legacy-peer-deps

# Source for shared packages + API, then build in dependency order.
COPY packages/core packages/core
COPY packages/database packages/database
COPY apps/api apps/api

RUN npm run build --workspace=@kamusi/core
RUN npm run build --workspace=@kamusi/database
RUN npm run build --workspace=api

# Production stage: copy only what the API needs at runtime.
FROM node:20-alpine

WORKDIR /app

# node_modules contains the @kamusi/* workspace symlinks that resolve into
# /app/packages, so copy the tree plus the packages (with built dist).
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/main.js"]
