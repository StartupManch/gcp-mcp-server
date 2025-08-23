# Contributing to GCP MCP Server

Thank you for your interest in contributing to the GCP MCP Server! This guide will help you get started with contributing to this project.

## 🤝 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **Bug Reports**: Help us identify and fix issues
- **Feature Requests**: Suggest new functionality
- **Code Contributions**: Implement features or fix bugs
- **Documentation**: Improve or add documentation
- **Testing**: Add or improve test coverage

### Getting Started

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/gcp-mcp.git
   cd gcp-mcp
   ```

2. **Set Up Development Environment**
   ```bash
   # Install dependencies
   npm install
   
   # Build the project
   npm run build
   
   # Run in development mode
   npm run dev
   ```

3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

### Development Workflow

1. **Make Your Changes**
   - Follow the existing code style
   - Add appropriate tests
   - Update documentation if needed

2. **Test Your Changes**
   ```bash
   # Run the build
   npm run build
   
   # Run linting
   npm run lint
   
   # Format code
   npm run format
   
   # Test the server
   npm test
   ```

3. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new tool for listing GKE clusters"
   ```

4. **Push and Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📋 Code Standards

### TypeScript Guidelines

- Use TypeScript for all new code
- Provide proper type definitions
- Avoid using `any` type
- Use interfaces for object shapes
- Export types from appropriate modules

Example:
```typescript
// Good
interface GCPResource {
  id: string;
  name: string;
  type: ResourceType;
  region?: string;
}

// Avoid
const resource: any = { ... };
```

### Error Handling

- Use the provided error utilities
- Implement proper retry logic
- Log errors appropriately
- Provide meaningful error messages

Example:
```typescript
import { withRetry, handleError, logger } from '../utils';

try {
  const result = await withRetry(async () => {
    return await gcpClient.someOperation();
  });
  return result;
} catch (error) {
  return handleError(error, 'perform GCP operation');
}
```

### Logging

- Use the centralized logger
- Log at appropriate levels
- Include context in log messages

Example:
```typescript
import { logger } from '../utils';

logger.info('Starting operation', { projectId, region });
logger.debug('API request details', { endpoint, params });
logger.error('Operation failed', error);
```

## 🧪 Testing Guidelines

### Unit Tests

- Write tests for all utility functions
- Mock external dependencies
- Test error conditions
- Aim for >80% code coverage

Example:
```typescript
describe('withRetry', () => {
  it('should retry failed operations', async () => {
    const mockOperation = jest.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValueOnce('Success');
    
    const result = await withRetry(mockOperation, 2);
    
    expect(result).toBe('Success');
    expect(mockOperation).toHaveBeenCalledTimes(2);
  });
});
```

### Integration Tests

- Test tool handlers with mocked GCP services
- Verify MCP protocol compliance
- Test error scenarios

## 🛠️ Adding New Tools

### Tool Structure

1. **Define the Tool Schema** (`src/tools/definitions.ts`)
   ```typescript
   {
     name: "your-tool-name",
     description: "Description of what the tool does",
     inputSchema: {
       type: "object",
       properties: {
         // Define parameters
       },
       required: ["requiredParam"]
     }
   }
   ```

2. **Implement the Handler** (`src/tools/handlers.ts`)
   ```typescript
   async yourToolName(args: ToolCallArgs): Promise<ToolResponse> {
     try {
       // Implement tool logic
       const result = await this.performOperation(args);
       
       return {
         content: [{
           type: "text",
           text: JSON.stringify({ success: true, result }, null, 2)
         }]
       };
     } catch (error) {
       return this.handleToolError('your operation', error);
     }
   }
   ```

3. **Add to Server Router** (`src/server.ts`)
   ```typescript
   case "your-tool-name":
     return await this.toolHandlers.yourToolName(args as ToolCallArgs);
   ```

### Tool Guidelines

- Keep tools focused on single operations
- Provide clear, descriptive names
- Include comprehensive parameter validation
- Return structured, consistent responses
- Handle errors gracefully
- Add appropriate logging

## 📝 Documentation Standards

### Code Documentation

- Add JSDoc comments for all public functions
- Include parameter descriptions
- Document return types
- Provide usage examples

Example:
```typescript
/**
 * Executes a GCP operation with automatic retry logic
 * @param operation - The async operation to execute
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Promise resolving to the operation result
 * @throws GCPMCPError when all retries are exhausted
 * 
 * @example
 * ```typescript
 * const result = await withRetry(async () => {
 *   return await gcpClient.listInstances();
 * });
 * ```
 */
async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T>
```

### README Updates

- Update the main README for user-facing changes
- Add new tools to the tools table
- Include usage examples for new features
- Update installation instructions if needed

## 🔍 Code Review Process

### Submitting Pull Requests

1. **Create a Descriptive Title**
   - Use conventional commit format: `feat:`, `fix:`, `docs:`, etc.
   - Be specific about the change

2. **Write a Good Description**
   - Explain what the change does
   - Include motivation and context
   - List any breaking changes
   - Reference related issues

3. **Ensure Quality**
   - All tests pass
   - Code is properly formatted
   - Documentation is updated
   - No linting errors

### Review Criteria

- Code follows project standards
- Changes are well-tested
- Documentation is complete
- Breaking changes are justified
- Performance impact is considered

## 🐛 Reporting Issues

### Bug Reports

Include the following information:

- **Environment**: OS, Node.js version, package version
- **Steps to Reproduce**: Clear, minimal steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Logs**: Relevant error messages or logs
- **Context**: Any additional context

### Feature Requests

Include the following information:

- **Use Case**: Why this feature is needed
- **Proposed Solution**: How you envision it working
- **Alternatives**: Other solutions you've considered
- **Examples**: Similar features in other tools

## 📚 Resources

### Documentation

- [Project Architecture](./PROJECT_ANALYSIS.md)
- [API Documentation](./API.md) (coming soon)
- [Deployment Guide](./DEPLOYMENT.md) (coming soon)

### External Resources

- [Model Context Protocol Specification](https://github.com/modelcontextprotocol/servers)
- [Google Cloud Client Libraries](https://cloud.google.com/nodejs/docs/reference)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 💬 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: For private inquiries

## 📜 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to the GCP MCP Server! 🚀
