---
name: Release Template
about: Template for creating standardized releases
title: 'Release v[VERSION]'
labels: release
---

## 🚀 GCP MCP Server v[VERSION]

**Release Date:** [DATE]

### 🎯 What's New

[Describe the major features and improvements in this release]

### ✨ Key Features

- 🔍 **Natural Language Interface**: Query GCP resources using plain English
- ☁️ **Multi-Project Support**: Work across multiple GCP projects seamlessly
- 🌐 **Global Region Support**: Full support for all GCP regions worldwide
- 🔐 **Secure by Design**: Uses local GCP credentials (no external exposure)
- 🏃‍♂️ **Local Execution**: All operations run locally with your authenticated session
- 🔄 **Automatic Retries**: Built-in retry logic for improved reliability
- 📊 **Rich Logging**: Comprehensive logging with configurable levels
- 🛠️ **Developer Friendly**: Full TypeScript implementation

### 🔧 Available Tools

| Tool                | Description                           | Use Case                  |
| ------------------- | ------------------------------------- | ------------------------- |
| `list-projects`     | List all accessible GCP projects      | Project discovery         |
| `select-project`    | Select a project for operations       | Project context switching |
| `run-gcp-code`      | Execute GCP operations via TypeScript | Custom resource queries   |
| `get-billing-info`  | Get project billing information       | Cost monitoring           |
| `get-cost-forecast` | Get cost forecasting data             | Budget planning           |

### 🎨 Supported AI Assistants

- **Claude Desktop** - Full integration support
- **VS Code** - Via Continue, Cursor, or Claude Dev extensions
- **Cursor** - Native MCP support
- **Windsurf** - Complete compatibility
- **Any MCP-compatible client** - Universal support

### 📦 Installation

**NPX (Recommended)**

```bash
npx gcp-mcp-server
```

**Global Installation**

```bash
npm install -g gcp-mcp-server@[VERSION]
```

**From Source**

```bash
git clone https://github.com/StartupManch/gcp-mcp-server
cd gcp-mcp-server
npm install && npm run build
```

### ⚙️ Quick Setup

**1. Install & Authenticate**

```bash
# Authenticate with GCP
gcloud auth application-default login

# Verify installation
npx gcp-mcp-server --help
```

**2. Configure Your AI Assistant**

For **Claude Desktop**, add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "gcp": {
      "command": "sh",
      "args": ["-c", "npx -y gcp-mcp-server"]
    }
  }
}
```

For **VS Code**, add to settings:

```json
{
  "mcp.servers": {
    "gcp": {
      "command": "sh",
      "args": ["-c", "npx -y gcp-mcp-server"]
    }
  }
}
```

### 💡 Example Interactions

```
"List all my GCP projects"
"Select project my-web-app-prod"
"Show me all running compute instances"
"Get billing information for current project"
"List Cloud Functions with errors in the last week"
"Find storage buckets consuming more than 100GB"
```

### 🔄 What's Changed

[Auto-generated changelog will appear here]

### 🐛 Bug Fixes

[List of bug fixes in this release]

### 🛡️ Security

[Any security-related changes or fixes]

### 📚 Documentation

- **[Quick Start Guide](README.md)** - Get up and running in minutes
- **[API Documentation](docs/API.md)** - Detailed tool reference
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

### 🤝 Community & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/StartupManch/gcp-mcp-server/issues)
- **Discussions**: [Community support and ideas](https://github.com/StartupManch/gcp-mcp-server/discussions)
- **Documentation**: [Comprehensive guides](https://github.com/StartupManch/gcp-mcp-server/docs)

### 📈 Performance Metrics

- **Package Size**: ~20KB compressed
- **Startup Time**: <500ms
- **Memory Usage**: <50MB baseline
- **API Response Time**: <100ms average (excluding GCP API latency)

### 🙏 Acknowledgments

- Built on the [Model Context Protocol](https://github.com/modelcontextprotocol/servers)
- Powered by [Google Cloud Client Libraries](https://cloud.google.com/nodejs/docs/reference)
- Inspired by the amazing AI assistant community

---

**Full Changelog**: [v[PREVIOUS_VERSION]...v[VERSION]](https://github.com/StartupManch/gcp-mcp-server/compare/v[PREVIOUS_VERSION]...v[VERSION])

**Download**: [gcp-mcp-server-[VERSION].tgz](https://github.com/StartupManch/gcp-mcp-server/releases/download/v[VERSION]/gcp-mcp-server-[VERSION].tgz)

**NPM Package**: [npmjs.com/package/gcp-mcp-server](https://www.npmjs.com/package/gcp-mcp-server)
