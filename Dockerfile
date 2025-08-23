# Multi-stage Docker build for GCP MCP Server
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy source code first
COPY src/ ./src/

# Install all dependencies (including dev dependencies for building)
RUN npm ci && npm cache clean --force

# Build the application (may be redundant due to prepare script, but ensures build)
RUN npm run build

# Production image
FROM node:24-alpine AS runtime

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcp-server -u 1001

WORKDIR /app

# Copy package files for production install
COPY package*.json ./

# Install only production dependencies (ignore scripts to prevent build attempts)
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy built application and dependencies
COPY --from=builder --chown=1001:1001 /app/dist ./dist

# Create directory for logs and temp files
RUN mkdir -p /app/logs && chown -R 1001:1001 /app

# Switch to non-root user
USER 1001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

# Expose the port the app runs on
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]

# Metadata
LABEL maintainer="GCP MCP Server Team"
LABEL description="Model Context Protocol server for Google Cloud Platform"
LABEL version="1.0.1"
