# Build stage - compiles TypeScript and React
FROM node:22-alpine as builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build both frontend and backend
RUN npm run build

# Production stage - runs the application
FROM node:22-alpine
WORKDIR /app

# Install tsx for TypeScript execution (if needed)
RUN npm install -g tsx

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY scripts ./scripts
COPY tsconfig.server.json ./

# Create data directory for SQLite database
RUN mkdir -p /app/data
VOLUME ["/app/data"]

# Expose production port
EXPOSE 4000

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=4000
ENV DATA_DIRECTORY=/app/data/

# Start application
CMD ["node", "dist/server/index.js"]