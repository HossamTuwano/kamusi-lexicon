# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy entire monorepo
COPY . .

# Install dependencies across workspace
RUN npm install --legacy-peer-deps

# Build API workspace target
RUN npm run build --workspace=apps/api

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install --legacy-peer-deps

COPY --from=build /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api

EXPOSE 3001
CMD ["node", "dist/main.js"]
