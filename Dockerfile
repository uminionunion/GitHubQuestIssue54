# Build stage: Node.js 22 on Alpine Linux compiles TypeScript and frontend assets.
# The "AS builder" name lets later COPY commands reference this stage.
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package.json and package-lock.json into the container.
COPY package*.json ./

# Install all dependencies, including development dependencies required to build.
# npm ci performs a clean, lockfile-based install.
RUN npm ci

# Copy the complete project source code into the container.
COPY . .

# Compile TypeScript and build the frontend into the dist/ directory.
RUN npm run build

# Production stage: a fresh, lightweight runtime image that excludes source code,
# build tools, the TypeScript compiler, and development dependencies.
FROM node:22-alpine AS runtime
WORKDIR /app

# Set the runtime environment, listening port, and persistent data directory.
ENV NODE_ENV=production
ENV PORT=4000
ENV DATA_DIRECTORY=/app/data

# Copy only package manifests from the builder stage, not the source code.
COPY --from=builder /app/package*.json ./

# Install only production dependencies.
RUN npm ci --production

# Copy compiled server and frontend assets, startup scripts, and server config.
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/tsconfig.server.json ./

# Create the persistent SQLite data directory and declare it as a Docker volume.
RUN mkdir -p /app/data
VOLUME ["/app/data"]

# Document the port used by the application. Port publishing is configured by Docker.
EXPOSE 4000

# Initialize SQLite, backfill recognized pantry locations, then start the server.
# sh -c is used so the second command runs only when initialization succeeds.
CMD ["sh", "-c", "node scripts/init-db.cjs && node scripts/backfill-pantry-locations.cjs && node dist/server/index.js"]
