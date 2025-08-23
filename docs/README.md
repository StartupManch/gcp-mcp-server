# GCP MCP Server

[![Version](https://img.shields.io/npm/v/gcp-mcp-server)](https://www.npmjs.com/package/gcp-mcp-server)
[![License](https://img.shields.io/github/license/startupmanch/gcp-mcp)](https://github.com/startupmanch/gcp-mcp/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)

A sophisticated Model Context Protocol (MCP) server that enables **any MCP-compatible AI assistant** to interact seamlessly with your Google Cloud Platform environment through natural language. Works with Claude, Cursor, Windsurf, and any other MCP-compatible application.

![GCP MCP Demo](images/claude.png)

## ✨ Features

- 🔍 **Natural Language Querying**: Interact with GCP resources using plain English
- ☁️ **Multi-Project Support**: Work across multiple GCP projects effortlessly
- 🌐 **Multi-Region Operations**: Support for all GCP regions worldwide
- 🔐 **Secure Authentication**: Uses your local GCP credentials (ADC) - no external credential sharing
- 🏃‍♂️ **Local Execution**: All operations run locally with your authenticated session
- 🔄 **Automatic Retries**: Built-in retry logic for improved reliability
- 📊 **Rich Logging**: Comprehensive logging with configurable levels
- 🛠️ **TypeScript**: Fully typed codebase for better developer experience

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **Claude Desktop**, **Cursor**, or **Windsurf** IDE
- **GCP CLI** configured with your credentials (`gcloud auth application-default login`)

### Installation

#### Option 1: NPM (Recommended)

```bash
npx gcp-mcp-server
```

#### Option 2: Local Development

```bash
git clone https://github.com/startupmanch/gcp-mcp-server
cd gcp-mcp-server
npm install
npm run build
npm start
```

## ⚙️ Configuration

### Claude Desktop Setup

1. Open Claude Desktop → **Settings** → **Developer** → **Edit Config**

2. Add the server configuration to your `claude_desktop_config.json`:

**Using NPX (Recommended):**

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

**Using Local Installation:**

```json
{
  "mcpServers": {
    "gcp": {
      "command": "node",
      "args": ["/path/to/gcp-mcp/dist/index.js"]
    }
  }
}
```

### Cursor/Windsurf Setup

Add to your workspace `.cursorrules` or editor configuration:

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

## 🛠️ Available Tools

| Tool                | Description                      | Parameters                                   |
| ------------------- | -------------------------------- | -------------------------------------------- |
| `list-projects`     | List all accessible GCP projects | None                                         |
| `select-project`    | Select a project for operations  | `projectId`, `region?`                       |
| `run-gcp-code`      | Execute GCP operations via code  | `reasoning`, `code`, `projectId?`, `region?` |
| `get-billing-info`  | Get project billing information  | `projectId?`                                 |
| `get-cost-forecast` | Get cost forecasting data        | `projectId?`, `months?`                      |

## 💡 Usage Examples

### Basic Operations

```
"List all my GCP projects"
"Select project my-web-app-prod"
"Show me all running compute instances"
"List storage buckets in us-west1"
"Get billing information for current project"
```

### Advanced Queries

```
"Show me BigQuery datasets that haven't been accessed in 30 days"
"List all Cloud Functions with more than 100 errors in the last week"
"Find storage buckets consuming more than 100GB"
"Show GKE clusters with outdated Kubernetes versions"
"Get cost breakdown by service for the last month"
```

### Code Execution Examples

The `run-gcp-code` tool allows you to execute TypeScript code using Google Cloud client libraries:

```typescript
// List all compute instances
const { InstancesClient } = require('@google-cloud/compute');
const instancesClient = new InstancesClient();

const [instances] = await instancesClient.aggregatedList({
  project: projectId,
});

return Object.entries(instances)
  .filter(([_, instanceList]) => instanceList.instances?.length > 0)
  .map(([zone, instanceList]) => ({
    zone: zone.split('/').pop(),
    instances: instanceList.instances.map(i => ({
      name: i.name,
      status: i.status,
      machineType: i.machineType?.split('/').pop(),
    })),
  }));
```

## 🏗️ Architecture

```
src/
├── types/           # TypeScript type definitions
│   ├── gcp.ts      # GCP-specific types
│   ├── mcp.ts      # MCP protocol types
│   └── index.ts    # Type exports
├── utils/           # Utility functions
│   ├── logger.ts   # Logging utilities
│   ├── errors.ts   # Error handling
│   ├── state.ts    # State management
│   └── index.ts    # Utility exports
├── tools/           # MCP tool implementations
│   ├── definitions.ts  # Tool schemas
│   ├── handlers.ts     # Tool handlers
│   └── index.ts        # Tool exports
├── config.ts        # Configuration constants
├── server.ts        # Main MCP server
└── index.ts         # Entry point
```

## 🧪 Development

### Setup Development Environment

```bash
git clone https://github.com/startupmanch/gcp-mcp-server
cd gcp-mcp-server
npm install
```

### Available Scripts

```bash
npm run dev           # Start development server
npm run dev:watch     # Start with auto-reload
npm run build         # Build for production
npm run test          # Test the built server
npm run clean         # Clean build artifacts
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
```

### Project Structure

- **`src/`** - Source code
- **`dist/`** - Compiled output
- **`tests/`** - Test files (future)
- **`docs/`** - Documentation

### Environment Variables

```bash
# Optional: Set log level
export LOG_LEVEL=debug  # debug, info, warn, error

# Optional: Set default region
export GOOGLE_CLOUD_REGION=us-central1
```

## 🔧 Configuration Options

### Logging

Set the `LOG_LEVEL` environment variable:

```bash
export LOG_LEVEL=debug    # Most verbose
export LOG_LEVEL=info     # Default
export LOG_LEVEL=warn     # Warnings only
export LOG_LEVEL=error    # Errors only
```

### Regions

Default region is `us-central1`. Override per operation or globally:

```bash
export GOOGLE_CLOUD_REGION=europe-west1
```

## 🐛 Troubleshooting

### Common Issues

**Authentication Errors:**

```bash
# Ensure you're logged in
gcloud auth application-default login

# Verify credentials
gcloud auth list
```

**Permission Errors:**

```bash
# Check project access
gcloud projects list

# Verify IAM permissions
gcloud iam roles describe roles/viewer
```

**Connection Issues:**

```bash
# Test basic connectivity
gcloud config list
gcloud info
```

### Debug Mode

Enable debug logging for detailed output:

```bash
export LOG_LEVEL=debug
npm run dev
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on the [Model Context Protocol](https://github.com/modelcontextprotocol/servers) by Anthropic
- Uses [Google Cloud Client Libraries](https://cloud.google.com/nodejs/docs/reference)
- Inspired by the need for natural language cloud operations

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/startupmanch/gcp-mcp-server/issues)
- **Discussions**: [GitHub Discussions](https://github.com/startupmanch/gcp-mcp-server/discussions)
- **Email**: [Support Email](mailto:devesh@startupmanch.in)

---

**Made with ❤️ for the Cloud Native Community**
