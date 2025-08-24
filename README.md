# GCP MCP Server

[![NPM Version](https://img.shields.io/npm/v/gcp-mcp-server)](https://www.npmjs.com/package/gcp-mcp-server)
[![License](https://img.shields.io/github/license/startupmanch/gcp-mcp-server)](https://github.com/startupmanch/gcp-mcp-server/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-green)](https://modelcontextprotocol.io/)

A comprehensive **Model Context Protocol (MCP) server** that enables AI assistants to interact seamlessly with your Google Cloud Platform environment. Built with TypeScript and featuring 25+ tools across 8 major GCP service categories.

## ✨ Key Features

- 🤖 **AI-Native**: Natural language interface for all GCP operations
- 🔐 **Secure**: Uses your existing GCP credentials (no external access required)
- 🌐 **Multi-Project**: Seamlessly work across multiple GCP projects and regions
- ⚡ **Comprehensive**: 25 tools covering compute, storage, databases, serverless, and more
- 🛠️ **Developer-Friendly**: Full TypeScript implementation with excellent error handling
- 🔄 **Reliable**: Built-in retry logic and robust error handling
- 📊 **Observable**: Comprehensive logging for debugging and monitoring

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **Google Cloud SDK** configured with authentication
- **Claude Desktop**, **Cursor**, **Windsurf**, or any MCP-compatible AI assistant

### Installation & Setup

1. **Authenticate with GCP**:

   ```bash
   gcloud auth application-default login
   ```

2. **Install via NPX** (recommended):

   ```bash
   npx gcp-mcp-server
   ```

3. **Configure your AI assistant**:

   **Claude Desktop** - Add to `claude_desktop_config.json`:

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

   **Cursor** - Add to MCP settings:

   ```json
   {
     "gcp": {
       "command": "npx",
       "args": ["-y", "gcp-mcp-server"]
     }
   }
   ```

   **Windsurf** - Add to `~/.windsurf/config.json`:

   ```json
   {
     "mcpServers": {
       "gcp": {
         "command": "npx",
         "args": ["-y", "gcp-mcp-server"]
     }
   }
   ```

4. **Restart your AI assistant** and start chatting with your GCP environment!

## 🛠️ Available Tools (25 Total)

### 🔧 Core Management (5 tools)

| Tool                | Description                                     |
| ------------------- | ----------------------------------------------- |
| `run-gcp-code`      | Execute custom TypeScript code against GCP APIs |
| `list-projects`     | List all accessible GCP projects                |
| `select-project`    | Select a project for subsequent operations      |
| `get-billing-info`  | Get billing information and status              |
| `get-cost-forecast` | Get cost forecasting data                       |

### � Compute Engine (4 tools)

| Tool                     | Description                              |
| ------------------------ | ---------------------------------------- |
| `list-compute-instances` | List VM instances (by zone or all zones) |
| `get-compute-instance`   | Get detailed instance information        |
| `start-compute-instance` | Start a stopped instance                 |
| `stop-compute-instance`  | Stop a running instance                  |

### 🗄️ Cloud Storage (3 tools)

| Tool                      | Description                       |
| ------------------------- | --------------------------------- |
| `list-storage-buckets`    | List all storage buckets          |
| `list-storage-objects`    | List objects in a specific bucket |
| `get-storage-object-info` | Get metadata for specific objects |

### 📊 BigQuery (3 tools)

| Tool                     | Description                     |
| ------------------------ | ------------------------------- |
| `list-bigquery-datasets` | List all BigQuery datasets      |
| `list-bigquery-tables`   | List tables in a dataset        |
| `query-bigquery`         | Execute SQL queries on BigQuery |

### 🗃️ Cloud SQL (2 tools)

| Tool                 | Description                       |
| -------------------- | --------------------------------- |
| `list-sql-instances` | List all Cloud SQL instances      |
| `get-sql-instance`   | Get detailed instance information |

### ⚡ Cloud Functions (2 tools)

| Tool                   | Description                       |
| ---------------------- | --------------------------------- |
| `list-cloud-functions` | List all Cloud Functions          |
| `get-cloud-function`   | Get detailed function information |

### 🏃 Cloud Run (2 tools)

| Tool                      | Description                      |
| ------------------------- | -------------------------------- |
| `list-cloud-run-services` | List all Cloud Run services      |
| `get-cloud-run-service`   | Get detailed service information |

### 🚢 Google Kubernetes Engine (2 tools)

| Tool                | Description                      |
| ------------------- | -------------------------------- |
| `list-gke-clusters` | List all GKE clusters            |
| `get-gke-cluster`   | Get detailed cluster information |

### 📝 Cloud Logging (2 tools)

| Tool               | Description                      |
| ------------------ | -------------------------------- |
| `query-logs`       | Query Cloud Logging with filters |
| `list-log-entries` | List recent log entries          |

## 💡 Example Conversations

### Getting Started

```
User: "Show me all my GCP projects"
Assistant: [Lists all accessible projects with IDs and names]

User: "Use project my-web-app-prod"
Assistant: [Selects project and shows available regions]
```

### Infrastructure Management

```
User: "List all running compute instances in us-west1"
Assistant: [Shows VM instances with status, machine type, and IPs]

User: "What storage buckets do I have?"
Assistant: [Lists buckets with size, location, and storage class]

User: "Show me my Cloud Run services"
Assistant: [Displays services with URLs, traffic allocation, and status]
```

### Data & Analytics

```
User: "What BigQuery datasets are in my project?"
Assistant: [Lists datasets with creation time and location]

User: "Query my sales table for last month's revenue"
Assistant: [Executes SQL and returns results]
```

### Cost Management

```
User: "What's my current billing status?"
Assistant: [Shows billing account, budget alerts, and current usage]

User: "Forecast my costs for the next 3 months"
Assistant: [Displays cost predictions based on usage trends]
```

### Troubleshooting

```
User: "Show me error logs from my app in the last hour"
Assistant: [Queries Cloud Logging and displays relevant errors]

User: "Why is my Cloud Function timing out?"
Assistant: [Analyzes function configuration and recent logs]
```

## 🏗️ Architecture

The server is built with a clean, modular architecture:

```
src/
├── types/           # TypeScript type definitions
├── utils/           # Utilities (logging, errors, state management)
├── tools/           # Tool definitions and handlers
│   ├── definitions.ts
│   └── handlers.ts
├── config.ts        # Configuration constants
├── server.ts        # MCP server implementation
└── index.ts         # Application entry point
```

## 🔧 Development

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/startupmanch/gcp-mcp-server
cd gcp-mcp-server

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

### Available Scripts

```bash
npm run dev          # Development mode with auto-reload
npm run build        # Production build
npm run start        # Start built server
npm run test         # Run test suite
npm run lint         # Lint code
npm run format       # Format code with Prettier
npm run clean        # Clean build artifacts
```

### Testing with MCP Inspector

```bash
# Build and test with MCP Inspector
npm run build
npx @modelcontextprotocol/inspector ./bin.js
```

## 📋 Requirements

- **Node.js**: Version 18 or higher
- **Google Cloud SDK**: Properly configured and authenticated
- **GCP Projects**: Access to at least one GCP project with appropriate IAM permissions

### Required GCP APIs

The following APIs should be enabled in your GCP project:

- Cloud Resource Manager API
- Compute Engine API
- Cloud Storage API
- BigQuery API
- Cloud SQL Admin API
- Cloud Functions API
- Cloud Run API
- Cloud Logging API
- Cloud Billing API
- Kubernetes Engine API

## � Security & Permissions

### Required IAM Roles

Your GCP account needs the following roles (or equivalent custom roles):

- `roles/viewer` (basic read access)
- `roles/compute.viewer` (Compute Engine resources)
- `roles/storage.objectViewer` (Cloud Storage)
- `roles/bigquery.user` (BigQuery)
- `roles/cloudsql.viewer` (Cloud SQL)
- `roles/cloudfunctions.viewer` (Cloud Functions)
- `roles/run.viewer` (Cloud Run)
- `roles/container.viewer` (GKE)
- `roles/logging.viewer` (Cloud Logging)

### Security Features

- **Local Credentials**: Uses your local GCP authentication
- **No External Access**: All operations run locally
- **Principle of Least Privilege**: Only requests necessary permissions
- **Secure by Default**: No credentials stored or transmitted

## 🐛 Troubleshooting

### Common Issues

**Authentication Errors**

```bash
# Re-authenticate with GCP
gcloud auth application-default login

# Verify access
gcloud projects list
```

**Permission Denied**

- Verify your IAM roles include the required permissions
- Check that APIs are enabled in your GCP project

**Server Not Starting**

- Ensure Node.js v18+ is installed
- Verify GCP credentials are configured
- Check the server logs for specific errors

### Debug Mode

Enable debug logging:

```bash
export LOG_LEVEL=debug
npx gcp-mcp-server
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Run the test suite**: `npm test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new functionality
- Update documentation for new features
- Follow conventional commit messages
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on the [Model Context Protocol](https://modelcontextprotocol.io/)
- Uses [Google Cloud Client Libraries](https://cloud.google.com/nodejs/docs/reference)
- Inspired by the amazing MCP ecosystem

---

**Made with ❤️ for the AI and Cloud communities**

For support, feature requests, or bug reports, please [open an issue](https://github.com/startupmanch/gcp-mcp-server/issues) on GitHub.
