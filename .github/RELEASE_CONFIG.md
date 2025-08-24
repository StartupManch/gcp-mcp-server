# Release Configuration Template

This document outlines the automated release configuration for the GCP MCP Server.

## Semantic Release Configuration

The project uses semantic-release for automated publishing to both npm and GitHub releases.

### Release Triggers

Releases are triggered by conventional commits to the `main` branch:

- `feat:` → Minor version bump (1.0.0 → 1.1.0)
- `fix:` → Patch version bump (1.0.0 → 1.0.1)
- `feat!:` or `BREAKING CHANGE:` → Major version bump (1.0.0 → 2.0.0)

### Release Assets

Each release includes:

1. **NPM Package**
   - Published to `https://www.npmjs.com/package/gcp-mcp-server`
   - Includes only essential files (dist/, bin.js, README.md, LICENSE)
   - Optimized package size (~20KB)

2. **GitHub Release**
   - Auto-generated release notes from commits
   - Distribution files attached
   - Tagged with semantic version

3. **Docker Image**
   - Multi-platform build (linux/amd64, linux/arm64)
   - Published to GitHub Container Registry
   - Tagged with version and 'latest'

### Release Notes Format

```markdown
## GCP MCP Server v{VERSION}

### 🎯 What's New

{FEATURES}

### 🐛 Bug Fixes

{FIXES}

### 🔄 Changes

{CHANGES}

### 📦 Installation

npm install -g gcp-mcp-server

### 🔗 Links

- [NPM Package](https://www.npmjs.com/package/gcp-mcp-server)
- [GitHub Repository](https://github.com/StartupManch/gcp-mcp-server)
- [Documentation](https://github.com/StartupManch/gcp-mcp-server#readme)
```

## Manual Release Process

If manual release is needed:

```bash
# 1. Ensure you're on main branch
git checkout main
git pull origin main

# 2. Login to npm
npm login

# 3. Build the project
npm run build

# 4. Run tests
npm test

# 5. Publish to npm
npm publish

# 6. Create GitHub release manually via UI or CLI
```

## Release Checklist

Before each release:

- [ ] All tests passing
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Migration guide provided (if needed)
- [ ] Security vulnerabilities addressed
- [ ] Performance optimizations noted
- [ ] API changes documented

## Post-Release Tasks

After each release:

- [ ] Monitor npm download metrics
- [ ] Check for any immediate bug reports
- [ ] Update dependent projects
- [ ] Announce release in community channels
- [ ] Update documentation site
- [ ] Create social media posts

## Rollback Process

If a release needs to be rolled back:

```bash
# 1. Deprecate problematic version
npm deprecate gcp-mcp-server@{VERSION} "Critical bug - use previous version"

# 2. Publish fixed version immediately
npm version patch
npm publish

# 3. Update GitHub release with warning
# 4. Notify users via issues/discussions
```
