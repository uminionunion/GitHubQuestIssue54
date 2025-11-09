# Build stage - compiles TypeScript and frontend assets
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package manifests and install all deps for building
COPY package*.json ./
RUN npm ci

# Copy source and build both frontend and backend
COPY . .
RUN npm run build

# Production stage - small runtime image with only production deps
FROM node:22-alpine AS runtime
WORKDIR /app

# Set runtime environment and port
ENV NODE_ENV=production
ENV PORT=4000
ENV DATA_DIRECTORY=/app/data

# Copy only package manifests and install production dependencies
COPY --from=builder /app/package*.json ./
RUN npm ci --production

# Copy runtime artifacts and scripts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/tsconfig.server.json ./

# Ensure data directory exists and is a volume for persistence
RUN mkdir -p /app/data
VOLUME ["/app/data"]

# Expose the application port
EXPOSE 4000

# Use the init script before starting the server; keep CMD shell form to run multiple commands
CMD ["sh", "-c", "node scripts/init-db.cjs && node dist/server/index.js"]
