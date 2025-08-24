# Development Guide

## Overview

This guide provides comprehensive information for developers working on the GCP MCP Server project. It covers setup, development workflows, testing strategies, and best practices for a professional software engineering environment.

## Prerequisites

### Required Software

- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher (comes with Node.js)
- **Git**: Version 2.30 or higher
- **Google Cloud SDK**: Latest version
- **VS Code**: Recommended IDE with TypeScript support

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-python.python",
    "googlecloudtools.cloudcode"
  ]
}
```

### GCP Setup

1. **Install Google Cloud SDK**:

   ```bash
   # macOS (using Homebrew)
   brew install google-cloud-sdk

   # Or download from: https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate with GCP**:

   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

3. **Set default project** (optional):
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

## Development Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/startupmanch/gcp-mcp-server.git
cd gcp-mcp-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file for local development:

```bash
# .env (not committed to git)
LOG_LEVEL=debug
GCP_PROJECT_ID=your-test-project
GCP_REGION=us-central1
NODE_ENV=development
```

### 4. Build the Project

```bash
npm run build
```

### 5. Verify Setup

```bash
# Run tests
npm test

# Start development server
npm run dev

# Lint code
npm run lint
```

## Project Structure

```
gcp-mcp-server/
├── src/                      # Source code
│   ├── types/               # TypeScript type definitions
│   │   ├── index.ts        # Main type exports
│   │   ├── gcp.ts          # GCP-specific types
│   │   └── mcp.ts          # MCP protocol types
│   ├── utils/               # Utility functions
│   │   ├── logger.ts       # Logging utilities
│   │   ├── errors.ts       # Error handling
│   │   ├── state.ts        # State management
│   │   ├── retry.ts        # Retry logic
│   │   └── validation.ts   # Input validation
│   ├── tools/               # Tool implementations
│   │   ├── definitions.ts  # Tool schema definitions
│   │   ├── handlers.ts     # Business logic handlers
│   │   └── index.ts        # Tool exports
│   ├── config.ts           # Configuration constants
│   ├── server.ts           # MCP server implementation
│   └── index.ts            # Application entry point
├── tests/                   # Test files
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── fixtures/           # Test data and mocks
├── docs/                    # Documentation
├── dist/                    # Built output (git-ignored)
├── coverage/               # Test coverage reports (git-ignored)
└── node_modules/           # Dependencies (git-ignored)
```

## Development Workflow

### 1. Feature Development

1. **Create a feature branch**:

   ```bash
   git checkout -b feature/tool-name
   ```

2. **Implement changes**:
   - Add tool definitions in `src/tools/definitions.ts`
   - Implement handlers in `src/tools/handlers.ts`
   - Add appropriate TypeScript types
   - Write comprehensive tests

3. **Test your changes**:

   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. **Test with MCP Inspector**:
   ```bash
   npx @modelcontextprotocol/inspector ./bin.js
   ```

### 2. Adding New Tools

#### Step 1: Define Tool Schema

Add to `src/tools/definitions.ts`:

```typescript
{
  name: 'new-tool-name',
  description: 'Description of what the tool does',
  inputSchema: {
    type: 'object',
    properties: {
      projectId: {
        type: 'string',
        description: 'GCP project ID (optional, uses selected project)'
      },
      // Add other parameters
    },
    required: [] // Specify required parameters
  }
}
```

#### Step 2: Implement Handler

Add to `src/tools/handlers.ts`:

```typescript
async handleNewTool(args: NewToolArgs): Promise<ToolResult> {
  try {
    // Validate inputs
    const projectId = args.projectId || this.state.selectedProject;
    if (!projectId) {
      throw new Error('No project selected. Use select-project first.');
    }

    // Implement business logic
    const result = await this.performOperation(projectId, args);

    // Return formatted result
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    this.logger.error('Tool execution failed', { tool: 'new-tool', error });
    throw error;
  }
}
```

#### Step 3: Register Tool

Add to the switch statement in `src/server.ts`:

```typescript
case 'new-tool-name':
  return await this.handlers.handleNewTool(args);
```

#### Step 4: Add Types

Define interfaces in `src/types/`:

```typescript
export interface NewToolArgs {
  projectId?: string;
  // Other parameters
}

export interface NewToolResult {
  success: boolean;
  data: any;
}
```

#### Step 5: Write Tests

Create test file in `tests/unit/tools/`:

```typescript
describe('NewTool', () => {
  it('should handle valid input', async () => {
    // Test implementation
  });

  it('should handle errors gracefully', async () => {
    // Error handling tests
  });
});
```

### 3. Adding New GCP Services

#### Step 1: Add Dependencies

```bash
npm install @google-cloud/new-service
npm install --save-dev @types/google-cloud__new-service
```

#### Step 2: Create Client Factory

Add to utilities:

```typescript
export class NewServiceClient {
  private client: NewService;

  constructor() {
    this.client = new NewService({
      // Configuration
    });
  }

  async listResources(projectId: string): Promise<Resource[]> {
    // Implementation
  }
}
```

#### Step 3: Implement Tools

Follow the tool development process above.

## Testing Strategy

### Unit Tests

Located in `tests/unit/`, these test individual functions and classes:

```typescript
// tests/unit/tools/handlers.test.ts
import { GCPToolHandlers } from '../../../src/tools/handlers';

describe('GCPToolHandlers', () => {
  let handlers: GCPToolHandlers;

  beforeEach(() => {
    handlers = new GCPToolHandlers();
  });

  describe('listProjects', () => {
    it('should return projects list', async () => {
      const result = await handlers.handleListProjects({});
      expect(result.success).toBe(true);
      expect(Array.isArray(result.projects)).toBe(true);
    });
  });
});
```

### Integration Tests

Located in `tests/integration/`, these test end-to-end functionality:

```typescript
// tests/integration/server.test.ts
import { TestMCPClient } from '../helpers/test-client';

describe('MCP Server Integration', () => {
  let client: TestMCPClient;

  beforeEach(async () => {
    client = new TestMCPClient();
    await client.connect();
  });

  afterEach(async () => {
    await client.disconnect();
  });

  it('should list available tools', async () => {
    const tools = await client.listTools();
    expect(tools.length).toBeGreaterThan(0);
    expect(tools.some(t => t.name === 'list-projects')).toBe(true);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=handlers

# Run integration tests only
npm test -- tests/integration
```

### Test Coverage

The project maintains >80% test coverage. View coverage report:

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Code Quality

### Linting and Formatting

The project uses ESLint and Prettier for code quality:

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Pre-commit Hooks

Husky runs quality checks before commits:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

### Commit Message Format

Follow Conventional Commits:

```bash
# Feature addition
git commit -m "feat: add Cloud SQL instance management tools"

# Bug fix
git commit -m "fix: handle missing project ID in billing tools"

# Documentation
git commit -m "docs: update API reference for new tools"

# Breaking change
git commit -m "feat!: restructure tool response format"
```

## Debugging

### Debug Mode

Enable detailed logging:

```bash
export LOG_LEVEL=debug
npm run dev
```

### VS Code Debug Configuration

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug MCP Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/dist/index.js",
      "env": {
        "LOG_LEVEL": "debug",
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "sourceMaps": true,
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

### Debug with MCP Inspector

```bash
# Build first
npm run build

# Start inspector
npx @modelcontextprotocol/inspector ./bin.js

# Or with debug logging
LOG_LEVEL=debug npx @modelcontextprotocol/inspector ./bin.js
```

### Common Debug Scenarios

1. **Authentication Issues**:

   ```bash
   gcloud auth list
   gcloud auth application-default print-access-token
   ```

2. **Tool Execution Errors**:
   - Check logs for detailed error messages
   - Verify GCP API permissions
   - Test with minimal parameters

3. **Performance Issues**:
   - Use Node.js profiler
   - Monitor GCP API response times
   - Check network connectivity

## Performance Optimization

### Profiling

```bash
# CPU profiling
node --prof dist/index.js

# Memory profiling
node --inspect dist/index.js
```

### Monitoring

- **Response Times**: Track tool execution duration
- **Memory Usage**: Monitor for memory leaks
- **GCP API Calls**: Optimize for minimal API usage
- **Error Rates**: Track success/failure ratios

### Best Practices

1. **Efficient Data Fetching**:

   ```typescript
   // Good: Parallel requests
   const [instances, buckets] = await Promise.all([
     listInstances(projectId),
     listBuckets(projectId),
   ]);

   // Bad: Sequential requests
   const instances = await listInstances(projectId);
   const buckets = await listBuckets(projectId);
   ```

2. **Connection Reuse**:

   ```typescript
   // Singleton pattern for clients
   class ClientManager {
     private static clients = new Map();

     static getClient(service: string) {
       if (!this.clients.has(service)) {
         this.clients.set(service, new ServiceClient());
       }
       return this.clients.get(service);
     }
   }
   ```

3. **Error Handling**:
   ```typescript
   async withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await operation();
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await this.delay(Math.pow(2, i) * 1000);
       }
     }
   }
   ```

## Security Considerations

### Credential Management

- **Never commit credentials** to version control
- Use environment variables or GCP ADC
- Implement credential rotation strategies
- Monitor for credential exposure

### Input Validation

```typescript
import Joi from 'joi';

const projectIdSchema = Joi.string()
  .pattern(/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/)
  .required();

export function validateProjectId(projectId: string): void {
  const { error } = projectIdSchema.validate(projectId);
  if (error) {
    throw new ValidationError(`Invalid project ID: ${error.message}`);
  }
}
```

### Access Control

- Implement least-privilege principles
- Validate all user inputs
- Sanitize outputs for AI consumption
- Log security-relevant events

## Build and Deployment

### Build Process

```bash
# Clean build
npm run clean
npm run build

# Development build with watch
npm run dev

# Production build
npm run build:prod
```

### Package Verification

```bash
# Dry run package creation
npm pack --dry-run

# Test package installation
npm pack
npm install -g gcp-mcp-server-*.tgz
```

### Release Process

1. **Version Bump**:

   ```bash
   npm version patch  # or minor, major
   ```

2. **Build and Test**:

   ```bash
   npm run build
   npm test
   ```

3. **Publish**:
   ```bash
   npm publish
   ```

## Documentation Standards

### Code Documentation

````typescript
/**
 * Lists all Compute Engine instances in a project
 *
 * @param projectId - GCP project ID
 * @param zone - Optional zone filter
 * @returns Promise resolving to instances list
 * @throws {AuthenticationError} When GCP credentials are invalid
 * @throws {ValidationError} When parameters are invalid
 *
 * @example
 * ```typescript
 * const instances = await listComputeInstances('my-project', 'us-central1-a');
 * console.log(`Found ${instances.length} instances`);
 * ```
 */
async listComputeInstances(
  projectId: string,
  zone?: string
): Promise<ComputeInstance[]> {
  // Implementation
}
````

### API Documentation

- Use TypeScript interfaces for all parameters and responses
- Provide comprehensive examples
- Document error conditions
- Include performance considerations

### README Standards

- Clear installation instructions
- Working examples
- Troubleshooting guide
- Contributing guidelines

## Contributing Guidelines

### Pull Request Process

1. **Fork and Branch**:

   ```bash
   git fork https://github.com/startupmanch/gcp-mcp-server
   git checkout -b feature/your-feature
   ```

2. **Development**:
   - Write code following project standards
   - Add comprehensive tests
   - Update documentation

3. **Testing**:

   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. **Commit and Push**:

   ```bash
   git commit -m "feat: add new feature"
   git push origin feature/your-feature
   ```

5. **Create Pull Request**:
   - Clear description of changes
   - Link to related issues
   - Include test results

### Code Review Checklist

- [ ] Code follows TypeScript best practices
- [ ] Comprehensive test coverage
- [ ] Documentation updated
- [ ] Error handling implemented
- [ ] Performance considerations addressed
- [ ] Security implications reviewed
- [ ] Breaking changes documented

## Troubleshooting Common Issues

### Build Issues

```bash
# Clear dependencies and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Test Failures

```bash
# Run tests with verbose output
npm test -- --verbose

# Debug specific test
npm test -- --testPathPattern=specific-test --no-coverage
```

### GCP Authentication

```bash
# Check current authentication
gcloud auth list

# Re-authenticate
gcloud auth application-default login

# Check ADC file
ls -la ~/.config/gcloud/application_default_credentials.json
```

### Performance Issues

1. **Profile memory usage**:

   ```bash
   node --inspect dist/index.js
   ```

2. **Check GCP quotas**:

   ```bash
   gcloud compute project-info describe --project=PROJECT_ID
   ```

3. **Monitor API calls**:
   - Enable Cloud Logging
   - Use Cloud Monitoring
   - Check API quotas in console

For additional help, see the [troubleshooting guide](TROUBLESHOOTING.md) or [open an issue](https://github.com/startupmanch/gcp-mcp-server/issues).
