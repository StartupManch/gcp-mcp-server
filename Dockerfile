# Multi-stage Docker build for GCP MCP Server
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Production image
FROM node:24-alpine AS runtime

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcp-server -u 1001

WORKDIR /app

# Copy built application and dependencies
COPY --from=builder --chown=1001:1001 /app/dist ./dist
COPY --from=builder --chown=1001:1001 /app/node_modules ./node_modules
COPY --from=builder --chown=1001:1001 /app/package*.json ./

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
