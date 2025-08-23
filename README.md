# GCP MCP Server

[![Version](https://img.shields.io/npm/v/gcp-mcp-server)](https://www.npmjs.com/package/gcp-mcp-server)
[![License](https://img.shields.io/github/license/startupmanch/gcp-mcp-server)](https://github.com/startupmanch/gcp-mcp-server/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)

A Model Context Protocol (MCP) server that enables **any MCP-compatible AI assistant** to interact with your Google Cloud Platform environment. This allows for natural language querying and management of your GCP resources during conversations with AI assistants like Claude, Cursor, Windsurf, and any other MCP-compatible applications.

![GCP MCP Demo](images/claude.png)

## ✨ Features

- 🔍 **Natural Language Interface**: Query and modify GCP resources using plain English
- ☁️ **Multi-Project Support**: Work seamlessly across multiple GCP projects
- 🌐 **Multi-Region Support**: Full support for all GCP regions worldwide
- 🔐 **Secure by Design**: Uses your local GCP credentials (no external exposure)
- 🏃‍♂️ **Local Execution**: All operations run locally with your authenticated session
- 🔄 **Automatic Retries**: Built-in retry logic for improved reliability
- 📊 **Rich Logging**: Comprehensive logging with configurable levels
- 🛠️ **Developer Friendly**: Full TypeScript implementation with excellent DX

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- Claude Desktop/Cursor/Windsurf
- GCP credentials configured locally (`gcloud auth application-default login`)

### Installation

```bash
# Via NPX (Recommended)
npx gcp-mcp-server

# Or install globally
npm install -g gcp-mcp-server
```

### Configuration

#### Claude Desktop

1. Open Claude Desktop → Settings → Developer → Edit Config
2. Add to your `claude_desktop_config.json`:

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

#### Cursor/Windsurf

Add to your workspace configuration:

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

## 📋 Available Tools

| Tool                | Description                           | Parameters                                   |
| ------------------- | ------------------------------------- | -------------------------------------------- |
| `list-projects`     | List all accessible GCP projects      | None                                         |
| `select-project`    | Select a project for operations       | `projectId`, `region?`                       |
| `run-gcp-code`      | Execute GCP operations via TypeScript | `reasoning`, `code`, `projectId?`, `region?` |
| `get-billing-info`  | Get project billing information       | `projectId?`                                 |
| `get-cost-forecast` | Get cost forecasting data             | `projectId?`, `months?`                      |

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

## 🏗️ Architecture

The project follows a modular, professional structure:

```
src/
├── types/           # TypeScript definitions
├── utils/           # Utilities (logging, errors, state)
├── tools/           # Tool implementations
├── config.ts        # Configuration
├── server.ts        # MCP server
└── index.ts         # Entry point
```

## 🔧 Development

### Setup

```bash
git clone https://github.com/startupmanch/gcp-mcp-server
cd gcp-mcp-server
npm install
npm run build
```

### Available Scripts

```bash
npm run dev           # Development mode
npm run build         # Production build
npm run test          # Test the server
npm run lint          # Lint code
npm run format        # Format code
```

## 📚 Documentation

- **[Project Analysis & Roadmap](docs/PROJECT_ANALYSIS.md)** - Detailed analysis and future plans
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[Full Documentation](docs/README.md)** - Comprehensive guide

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 🐛 Troubleshooting

### Authentication Issues

```bash
# Ensure you're logged in
gcloud auth application-default login

# Verify access
gcloud projects list
```

### Debug Mode

```bash
export LOG_LEVEL=debug
npm run dev
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on the [Model Context Protocol](https://github.com/modelcontextprotocol/servers)
- Uses [Google Cloud Client Libraries](https://cloud.google.com/nodejs/docs/reference)

---

**Restructured and enhanced with ❤️ for better developer experience**

````

If you installed from source:
```json
{
  "mcpServers": {
    "gcp": {
      "command": "npm",
      "args": [
        "--silent",
        "--prefix",
        "/path/to/gcp-mcp-server",
        "start"
      ]
    }
  }
}
````

Replace `/path/to/gcp-mcp-server` with the actual path to your project directory if using source installation.

### Cursor

1. Open Cursor and go to Settings (⌘,)
2. Navigate to AI -> Model Context Protocol
3. Add a new MCP configuration:

```json
{
  "gcp": {
    "command": "npx -y gcp-mcp-server"
  }
}
```

### Windsurf

1. Open `~/.windsurf/config.json` (create if it doesn't exist)
2. Add the MCP configuration:

```json
{
  "mcpServers": {
    "gcp": {
      "command": "npx -y gcp-mcp-server"
    }
  }
}
```

### GCP Setup

1. Set up GCP credentials:
   - Set up application default credentials using `gcloud auth application-default login`

2. Refresh your AI assistant (Claude Desktop/Cursor/Windsurf)

## Usage

Start by selecting a project or asking questions like:

- "List all GCP projects I have access to"
- "Show me all Cloud SQL instances in project X"
- "What's my current billing status?"
- "Show me the logs from my Cloud Run services"
- "List all GKE clusters in us-central1"
- "Show me all Cloud Storage buckets in project X"
- "What Cloud Functions are deployed in us-central1?"
- "List all Cloud Run services"
- "Show me BigQuery datasets and tables"

## Available Tools

1. `run-gcp-code`: Execute GCP API calls using TypeScript code
2. `list-projects`: List all accessible GCP projects
3. `select-project`: Select a GCP project for subsequent operations
4. `get-billing-info`: Get billing information for the current project
5. `get-cost-forecast`: Get cost forecast for the current project
6. `get-billing-budget`: Get billing budgets for the current project
7. `list-gke-clusters`: List all GKE clusters in the current project
8. `list-sql-instances`: List all Cloud SQL instances in the current project
9. `get-logs`: Get Cloud Logging entries for the current project

## Example Interactions

1. List available projects:

```
List all GCP projects I have access to
```

2. Select a project:

```
Use project my-project-id
```

3. Check billing status:

```
What's my current billing status?
```

4. View logs:

```
Show me the last 10 log entries from my project
```

## Supported Services

- Google Compute Engine
- Cloud Storage
- Cloud Functions
- Cloud Run
- BigQuery
- Cloud SQL
- Google Kubernetes Engine (GKE)
- Cloud Logging
- Cloud Billing
- Resource Manager
- More coming soon...

## Troubleshooting

To see logs:

```bash
tail -n 50 -f ~/Library/Logs/Claude/mcp-server-gcp.log
```

Common issues:

1. Authentication errors: Ensure you've run `gcloud auth application-default login`
2. Permission errors: Check IAM roles for your account
3. API errors: Verify that required APIs are enabled in your project

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
