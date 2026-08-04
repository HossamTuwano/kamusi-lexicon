# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

COPY --from=build /app/dist ./dist

EXPOSE 3001
CMD ["node", "dist/main.js"]
