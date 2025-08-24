# Deployment Guide

## Overview

This guide covers deployment strategies for the GCP MCP Server, from local development to production distribution via NPM registry. The server is designed to be deployed as a lightweight, standalone package that integrates seamlessly with AI assistants.

## Deployment Models

### 1. NPM Package Distribution (Recommended)

The primary deployment model is distribution via NPM registry for easy installation and updates.

#### Package Structure

```
gcp-mcp-server/
├── dist/              # Compiled JavaScript
├── bin.js             # Executable entry point
├── package.json       # Package metadata
├── README.md          # Documentation
└── LICENSE           # License file
```

#### NPM Package Configuration

```json
{
  "name": "gcp-mcp-server",
  "version": "1.1.4",
  "main": "dist/index.js",
  "bin": {
    "gcp-mcp-server": "./bin.js"
  },
  "files": ["dist/", "bin.js", "README.md", "LICENSE"],
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### Installation Methods

**NPX (Recommended for users):**

```bash
npx gcp-mcp-server
```

**Global Installation:**

```bash
npm install -g gcp-mcp-server
gcp-mcp-server
```

**Local Installation:**

```bash
npm install gcp-mcp-server
./node_modules/.bin/gcp-mcp-server
```

### 2. Source Installation

For development or customization purposes.

```bash
git clone https://github.com/startupmanch/gcp-mcp-server.git
cd gcp-mcp-server
npm install
npm run build
npm start
```

### 3. Docker Deployment

For containerized environments (future enhancement).

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY bin.js ./

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## Build Process

### Local Build

```bash
# Clean build
npm run clean
npm run build

# Verify build
npm run test
npm run lint
```

### Automated Build (CI/CD)

GitHub Actions workflow (`.github/workflows/ci.yml`):

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 19, 20]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build project
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Semantic Release
        run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Release Process

### Semantic Versioning

The project follows [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes (`2.0.0`)
- **MINOR**: New features (`1.1.0`)
- **PATCH**: Bug fixes (`1.1.1`)

### Automated Releases

Using `semantic-release` for automated versioning and publishing:

```json
{
  "release": {
    "branches": ["main"],
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/github",
      "@semantic-release/git"
    ]
  }
}
```

### Manual Release Process

1. **Version Bump**:

   ```bash
   npm version patch  # or minor/major
   ```

2. **Build and Test**:

   ```bash
   npm run build
   npm test
   npm run lint
   ```

3. **Publish to NPM**:

   ```bash
   npm publish
   ```

4. **Create GitHub Release**:
   ```bash
   git tag v1.1.4
   git push origin v1.1.4
   ```

## Environment Configuration

### Production Environment

**Required Environment Variables:**

```bash
NODE_ENV=production
LOG_LEVEL=info
```

**Optional Environment Variables:**

```bash
GCP_PROJECT_ID=default-project
GCP_REGION=us-central1
MAX_RETRIES=3
TIMEOUT_MS=30000
```

### Configuration File Support

Create `config.json` in working directory:

```json
{
  "server": {
    "name": "gcp-mcp-server",
    "version": "1.1.4",
    "timeout": 30000
  },
  "gcp": {
    "defaultRegion": "us-central1",
    "maxRetries": 3,
    "retryDelay": 1000
  },
  "logging": {
    "level": "info",
    "format": "json"
  }
}
```

## Client Integration

### Claude Desktop Configuration

**Basic Configuration:**

```json
{
  "mcpServers": {
    "gcp": {
      "command": "npx",
      "args": ["-y", "gcp-mcp-server"]
    }
  }
}
```

**Advanced Configuration:**

```json
{
  "mcpServers": {
    "gcp": {
      "command": "npx",
      "args": ["-y", "gcp-mcp-server"],
      "env": {
        "LOG_LEVEL": "debug",
        "GCP_PROJECT_ID": "my-default-project"
      }
    }
  }
}
```

### Cursor Configuration

Add to workspace settings or global configuration:

```json
{
  "mcp.servers": {
    "gcp": {
      "command": "npx",
      "args": ["-y", "gcp-mcp-server"]
    }
  }
}
```

### Windsurf Configuration

Add to `~/.windsurf/config.json`:

```json
{
  "mcpServers": {
    "gcp": {
      "command": "npx",
      "args": ["-y", "gcp-mcp-server"]
    }
  }
}
```

## Monitoring and Observability

### Logging

**Structured Logging:**

```typescript
logger.info('Tool execution completed', {
  tool: 'list-compute-instances',
  projectId: 'my-project',
  duration: 1234,
  resultCount: 5,
  timestamp: new Date().toISOString(),
});
```

**Log Levels:**

- `error`: Critical errors requiring attention
- `warn`: Warning conditions
- `info`: General information (default)
- `debug`: Detailed debugging information

### Health Checks

Basic health check endpoint (future enhancement):

```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: process.env.npm_package_version,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
```

### Metrics Collection

Key metrics to monitor:

- **Tool Execution Time**: Average and percentile response times
- **Success Rate**: Percentage of successful tool executions
- **Error Rate**: Frequency and types of errors
- **GCP API Usage**: API call counts and quotas
- **Memory Usage**: Process memory consumption
- **Active Sessions**: Number of concurrent MCP connections

## Security Considerations

### Credential Management

**Development:**

```bash
# Use application default credentials
gcloud auth application-default login
```

**Production:**

```bash
# Use service account key
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

**Container Deployment:**

```yaml
# Kubernetes deployment with service account
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: gcp-mcp-server
  containers:
    - name: gcp-mcp-server
      image: gcp-mcp-server:latest
```

### Network Security

- **No inbound network access required**
- **Outbound access to GCP APIs only**
- **Local communication via stdio (MCP protocol)**
- **No persistent data storage**

### Access Control

**Required GCP IAM Roles:**

```bash
# Minimum read-only access
roles/viewer
roles/compute.viewer
roles/storage.objectViewer
roles/bigquery.user
roles/cloudsql.viewer
roles/cloudfunctions.viewer
roles/run.viewer
roles/container.viewer
roles/logging.viewer
```

**Custom Role Definition:**

```json
{
  "title": "GCP MCP Server Role",
  "description": "Minimum permissions for GCP MCP Server",
  "stage": "GA",
  "includedPermissions": [
    "resourcemanager.projects.list",
    "compute.instances.list",
    "compute.instances.get",
    "storage.buckets.list",
    "storage.objects.list",
    "bigquery.datasets.get",
    "bigquery.tables.list",
    "cloudsql.instances.list",
    "cloudfunctions.functions.list",
    "run.services.list",
    "container.clusters.list",
    "logging.entries.list"
  ]
}
```

## Performance Optimization

### Production Build Optimization

```bash
# Production build with optimizations
npm run build:prod

# Bundle analysis
npm run analyze

# Memory profiling
node --inspect dist/index.js
```

### Runtime Optimization

**Connection Pooling:**

```typescript
const clientPool = new Map();

function getClient(service: string) {
  if (!clientPool.has(service)) {
    clientPool.set(
      service,
      new ServiceClient({
        // Optimized configuration
        maxRetries: 3,
        timeout: 30000,
      })
    );
  }
  return clientPool.get(service);
}
```

**Caching Strategy:**

```typescript
const cache = new LRUCache({
  max: 1000,
  ttl: 300000, // 5 minutes
});

async function getCachedData(key: string, fetcher: () => Promise<any>) {
  if (cache.has(key)) {
    return cache.get(key);
  }

  const data = await fetcher();
  cache.set(key, data);
  return data;
}
```

## Troubleshooting Deployment

### Common Issues

**1. Node.js Version Compatibility**

```bash
# Check Node.js version
node --version

# Install compatible version
nvm install 18
nvm use 18
```

**2. NPM Package Installation**

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**3. Build Failures**

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Verify dependencies
npm audit
npm audit fix
```

**4. Runtime Errors**

```bash
# Check environment
env | grep NODE
env | grep GOOGLE

# Verify GCP authentication
gcloud auth list
gcloud auth application-default print-access-token
```

### Debug Mode

Enable comprehensive debugging:

```bash
export DEBUG=gcp-mcp-server:*
export LOG_LEVEL=debug
npx gcp-mcp-server
```

### Performance Issues

**Memory Leaks:**

```bash
# Monitor memory usage
node --inspect --max-old-space-size=512 dist/index.js

# Heap dump analysis
node --heap-prof dist/index.js
```

**Slow API Responses:**

```bash
# Network diagnostics
curl -w "@curl-format.txt" -s -o /dev/null https://compute.googleapis.com

# GCP quota check
gcloud compute project-info describe --project=PROJECT_ID
```

## Rollback Procedures

### NPM Package Rollback

```bash
# Deprecate problematic version
npm deprecate gcp-mcp-server@1.1.4 "Critical bug, use 1.1.3"

# Publish hotfix
npm version patch
npm publish
```

### Git Rollback

```bash
# Revert commit
git revert HEAD

# Emergency rollback
git reset --hard GOOD_COMMIT_HASH
git push --force-with-lease
```

## Scaling Considerations

### Horizontal Scaling

For high-volume deployments:

1. **Load Balancer**: Distribute requests across instances
2. **Container Orchestration**: Use Kubernetes for scaling
3. **Session Affinity**: Maintain state consistency
4. **Resource Limits**: Set CPU and memory limits

### Vertical Scaling

Resource requirements:

- **CPU**: 0.5-1 core per instance
- **Memory**: 256-512 MB base + 100 MB per active session
- **Network**: Outbound bandwidth for GCP API calls
- **Storage**: Minimal (logs only)

### Future Enhancements

1. **Microservices Architecture**: Split into service-specific servers
2. **API Gateway**: Centralized request routing
3. **Caching Layer**: Redis for shared caching
4. **Message Queue**: Async processing for long-running operations
5. **Multi-tenancy**: Isolated execution contexts
6. **Auto-scaling**: Dynamic resource allocation based on load

For deployment support, see the [troubleshooting guide](TROUBLESHOOTING.md) or [open an issue](https://github.com/startupmanch/gcp-mcp-server/issues).
