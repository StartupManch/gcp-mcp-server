# NPM Package Publication Template

## Package Information

- **Name**: `gcp-mcp-server`
- **Version**: Managed by semantic-release
- **Description**: Model Context Protocol (MCP) server for Google Cloud Platform - Talk to your GCP resources
- **Keywords**: `gcp`, `mcp`, `claude`, `ai`, `llm`, `google-cloud`, `model-context-protocol`
- **License**: MIT
- **Repository**: https://github.com/StartupManch/gcp-mcp-server

## Package Contents

The published package includes:

```
gcp-mcp-server@{version}/
├── dist/                    # Compiled TypeScript
│   ├── index.js            # Main entry point
│   ├── server.js           # MCP server implementation
│   ├── config.js           # Configuration
│   ├── tools/              # Tool implementations
│   ├── types/              # Type definitions
│   └── utils/              # Utility functions
├── bin.js                  # Binary executable
├── README.md               # Documentation
├── LICENSE                 # MIT license
└── package.json            # Package manifest
```

## NPM Metadata

```json
{
  "name": "gcp-mcp-server",
  "description": "Model Context Protocol (MCP) server for Google Cloud Platform - Talk to your GCP resources",
  "version": "1.0.1",
  "main": "dist/index.js",
  "bin": {
    "gcp-mcp-server": "./bin.js"
  },
  "keywords": [
    "gcp",
    "mcp",
    "claude",
    "ai",
    "llm",
    "google-cloud",
    "model-context-protocol",
    "typescript",
    "nodejs"
  ],
  "author": "StartupManch Inc. - Devesh Kumar",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/StartupManch/gcp-mcp-server.git"
  },
  "homepage": "https://github.com/StartupManch/gcp-mcp-server#readme",
  "bugs": {
    "url": "https://github.com/StartupManch/gcp-mcp-server/issues"
  }
}
```

## Installation Commands

Users can install the package using:

```bash
# NPX (recommended for one-time use)
npx gcp-mcp-server

# Global installation
npm install -g gcp-mcp-server

# Local installation
npm install gcp-mcp-server

# Specific version
npm install gcp-mcp-server@1.0.1
```

## Package Stats

- **Unpacked Size**: ~76KB
- **Tarball Size**: ~20KB
- **File Count**: ~56 files
- **Dependencies**: Production dependencies only
- **Node.js**: Requires v18+

## Release Process

1. **Automatic** (via semantic-release):
   - Push conventional commit to main branch
   - CI/CD automatically builds and publishes

2. **Manual** (if needed):
   ```bash
   npm login
   npm run build
   npm publish
   ```

## NPM Package URL

Once published: https://www.npmjs.com/package/gcp-mcp-server

## Download Stats

Monitor package adoption at:

- NPM package page analytics
- GitHub repository insights
- Download counts via npm API
