# Testing Guide

## Overview

This guide covers comprehensive testing strategies for the GCP MCP Server, including unit tests, integration tests, end-to-end tests, and performance testing. Our testing approach ensures reliability, correctness, and maintainability across all 25 supported tools.

## Testing Philosophy

### Principles

1. **Test Pyramid**: Unit tests form the base, integration tests in the middle, E2E tests at the top
2. **Fail Fast**: Tests should fail quickly to provide rapid feedback
3. **Isolation**: Each test should be independent and not rely on external state
4. **Deterministic**: Tests should produce consistent results across environments
5. **Meaningful**: Tests should verify business logic and user scenarios

### Coverage Goals

- **Unit Tests**: >90% code coverage
- **Integration Tests**: All GCP service integrations
- **E2E Tests**: Critical user workflows
- **Performance Tests**: Latency and throughput benchmarks

## Test Structure

### Directory Organization

```
tests/
├── unit/                    # Unit tests
│   ├── tools/              # Tool-specific tests
│   │   ├── compute.test.ts
│   │   ├── storage.test.ts
│   │   └── ...
│   ├── handlers/           # Handler tests
│   └── utils/              # Utility function tests
├── integration/            # Integration tests
│   ├── gcp-services/       # GCP API integration
│   └── mcp-protocol/       # MCP protocol tests
├── e2e/                    # End-to-end tests
│   ├── scenarios/          # User scenario tests
│   └── performance/        # Performance tests
├── fixtures/               # Test data and mocks
│   ├── mock-responses/     # GCP API mock responses
│   └── test-data/          # Sample test data
└── helpers/                # Test utilities
    ├── mock-clients.ts     # GCP client mocks
    └── test-setup.ts       # Test environment setup
```

## Unit Testing

### Setup and Configuration

**Jest Configuration (`jest.config.js`):**

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/index.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/helpers/test-setup.ts'],
  testTimeout: 10000,
};
```

### Tool Testing Patterns

**Example: Compute Engine Tool Test:**

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { listComputeInstances } from '../../../src/tools/handlers/compute';
import { createMockComputeClient } from '../../helpers/mock-clients';

describe('Compute Engine Tools', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = createMockComputeClient();
    jest.clearAllMocks();
  });

  describe('listComputeInstances', () => {
    it('should return list of instances for valid project', async () => {
      // Arrange
      const mockInstances = [
        {
          name: 'instance-1',
          zone: 'us-central1-a',
          status: 'RUNNING',
          machineType: 'e2-medium',
        },
        {
          name: 'instance-2',
          zone: 'us-central1-b',
          status: 'STOPPED',
          machineType: 'e2-small',
        },
      ];

      mockClient.list.mockResolvedValue([mockInstances]);

      // Act
      const result = await listComputeInstances({
        projectId: 'test-project',
        zone: 'us-central1-a',
      });

      // Assert
      expect(result).toHaveProperty('instances');
      expect(result.instances).toHaveLength(2);
      expect(result.instances[0]).toMatchObject({
        name: 'instance-1',
        status: 'RUNNING',
      });
      expect(mockClient.list).toHaveBeenCalledWith({
        project: 'test-project',
        zone: 'us-central1-a',
      });
    });

    it('should handle empty instance list', async () => {
      // Arrange
      mockClient.list.mockResolvedValue([[]]);

      // Act
      const result = await listComputeInstances({
        projectId: 'test-project',
      });

      // Assert
      expect(result.instances).toHaveLength(0);
    });

    it('should handle GCP API errors gracefully', async () => {
      // Arrange
      const apiError = new Error('Project not found');
      apiError.code = 404;
      mockClient.list.mockRejectedValue(apiError);

      // Act & Assert
      await expect(listComputeInstances({ projectId: 'invalid-project' })).rejects.toThrow(
        'Project not found'
      );
    });

    it('should validate required parameters', async () => {
      // Act & Assert
      await expect(listComputeInstances({} as any)).rejects.toThrow('Project ID is required');
    });
  });
});
```

### Mock Client Implementation

**GCP Client Mocks (`tests/helpers/mock-clients.ts`):**

```typescript
export function createMockComputeClient() {
  return {
    list: jest.fn(),
    get: jest.fn(),
    insert: jest.fn(),
    delete: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  };
}

export function createMockStorageClient() {
  return {
    getBuckets: jest.fn(),
    bucket: jest.fn(() => ({
      getFiles: jest.fn(),
      file: jest.fn(() => ({
        exists: jest.fn(),
        download: jest.fn(),
        upload: jest.fn(),
      })),
    })),
  };
}

export function createMockBigQueryClient() {
  return {
    getDatasets: jest.fn(),
    dataset: jest.fn(() => ({
      getTables: jest.fn(),
      table: jest.fn(() => ({
        getMetadata: jest.fn(),
        query: jest.fn(),
      })),
    })),
  };
}
```

### Parameter Validation Testing

```typescript
describe('Parameter Validation', () => {
  const validationTests = [
    {
      name: 'missing projectId',
      params: { zone: 'us-central1-a' },
      expectedError: 'Project ID is required',
    },
    {
      name: 'invalid zone format',
      params: { projectId: 'test', zone: 'invalid-zone' },
      expectedError: 'Invalid zone format',
    },
    {
      name: 'empty projectId',
      params: { projectId: '', zone: 'us-central1-a' },
      expectedError: 'Project ID cannot be empty',
    },
  ];

  validationTests.forEach(({ name, params, expectedError }) => {
    it(`should reject ${name}`, async () => {
      await expect(listComputeInstances(params)).rejects.toThrow(expectedError);
    });
  });
});
```

## Integration Testing

### GCP Service Integration

**Cloud Storage Integration Test:**

```typescript
import { Storage } from '@google-cloud/storage';
import { listStorageBuckets } from '../../../src/tools/handlers/storage';

describe('Cloud Storage Integration', () => {
  let storage: Storage;
  let testProjectId: string;

  beforeAll(() => {
    // Use test project with proper authentication
    testProjectId = process.env.TEST_GCP_PROJECT_ID || 'test-project';
    storage = new Storage({ projectId: testProjectId });
  });

  describe('listStorageBuckets', () => {
    it('should connect to real GCP and list buckets', async () => {
      // Skip if no credentials available
      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.log('Skipping integration test - no GCP credentials');
        return;
      }

      const result = await listStorageBuckets({
        projectId: testProjectId,
      });

      expect(result).toHaveProperty('buckets');
      expect(Array.isArray(result.buckets)).toBe(true);

      if (result.buckets.length > 0) {
        expect(result.buckets[0]).toHaveProperty('name');
        expect(result.buckets[0]).toHaveProperty('location');
      }
    });
  });
});
```

### MCP Protocol Testing

**Protocol Compliance Test:**

```typescript
import { McpServer } from '../../../src/index';
import { createMCPClient } from '../../helpers/mcp-client';

describe('MCP Protocol Compliance', () => {
  let server: McpServer;
  let client: any;

  beforeEach(async () => {
    server = new McpServer();
    client = createMCPClient();
    await server.start();
  });

  afterEach(async () => {
    await server.stop();
  });

  it('should implement initialize handshake correctly', async () => {
    const response = await client.initialize({
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
      },
      clientInfo: {
        name: 'test-client',
        version: '1.0.0',
      },
    });

    expect(response).toHaveProperty('protocolVersion');
    expect(response).toHaveProperty('capabilities');
    expect(response.capabilities).toHaveProperty('tools');
  });

  it('should list all 25 tools correctly', async () => {
    await client.initialize({
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      clientInfo: { name: 'test', version: '1.0.0' },
    });

    const response = await client.listTools();

    expect(response.tools).toHaveLength(25);
    expect(response.tools.map(t => t.name)).toContain('list-compute-instances');
    expect(response.tools.map(t => t.name)).toContain('list-storage-buckets');
    expect(response.tools.map(t => t.name)).toContain('query-bigquery');
  });

  it('should execute tools with proper request/response format', async () => {
    await client.initialize({
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      clientInfo: { name: 'test', version: '1.0.0' },
    });

    const response = await client.callTool({
      name: 'list-compute-instances',
      arguments: { projectId: 'test-project' },
    });

    expect(response).toHaveProperty('content');
    expect(response.isError).toBe(false);
  });
});
```

## End-to-End Testing

### User Scenario Testing

**Complete Workflow Test:**

```typescript
describe('E2E User Scenarios', () => {
  describe('Infrastructure Discovery Workflow', () => {
    it('should discover complete GCP infrastructure', async () => {
      const client = createMCPClient();
      await client.initialize(defaultInitParams);

      // Step 1: List projects
      const projects = await client.callTool({
        name: 'list-projects',
        arguments: {},
      });
      expect(projects.isError).toBe(false);

      // Step 2: Discover compute resources
      const instances = await client.callTool({
        name: 'list-compute-instances',
        arguments: { projectId: 'test-project' },
      });
      expect(instances.isError).toBe(false);

      // Step 3: Check storage resources
      const buckets = await client.callTool({
        name: 'list-storage-buckets',
        arguments: { projectId: 'test-project' },
      });
      expect(buckets.isError).toBe(false);

      // Step 4: Query data resources
      const datasets = await client.callTool({
        name: 'list-bigquery-datasets',
        arguments: { projectId: 'test-project' },
      });
      expect(datasets.isError).toBe(false);

      // Verify complete workflow success
      expect([projects, instances, buckets, datasets].every(r => !r.isError)).toBe(true);
    });
  });

  describe('Error Handling Scenarios', () => {
    it('should handle authentication failures gracefully', async () => {
      // Test with invalid credentials
      const client = createMCPClient({ invalidAuth: true });
      await client.initialize(defaultInitParams);

      const response = await client.callTool({
        name: 'list-compute-instances',
        arguments: { projectId: 'test-project' },
      });

      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('Authentication failed');
    });

    it('should handle network timeouts properly', async () => {
      const client = createMCPClient({ timeout: 1 }); // 1ms timeout
      await client.initialize(defaultInitParams);

      const response = await client.callTool({
        name: 'list-compute-instances',
        arguments: { projectId: 'test-project' },
      });

      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('timeout');
    });
  });
});
```

## Performance Testing

### Latency Testing

**Response Time Benchmarks:**

```typescript
describe('Performance Tests', () => {
  describe('Response Time Benchmarks', () => {
    const performanceTargets = {
      'list-compute-instances': 2000, // 2 seconds
      'list-storage-buckets': 1500, // 1.5 seconds
      'query-bigquery': 5000, // 5 seconds
      'list-projects': 1000, // 1 second
    };

    Object.entries(performanceTargets).forEach(([toolName, maxTime]) => {
      it(`${toolName} should respond within ${maxTime}ms`, async () => {
        const startTime = Date.now();

        const response = await client.callTool({
          name: toolName,
          arguments: getTestArgsForTool(toolName),
        });

        const responseTime = Date.now() - startTime;

        expect(response.isError).toBe(false);
        expect(responseTime).toBeLessThan(maxTime);
      });
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple concurrent requests', async () => {
      const concurrentRequests = 10;
      const promises = Array.from({ length: concurrentRequests }, () =>
        client.callTool({
          name: 'list-compute-instances',
          arguments: { projectId: 'test-project' },
        })
      );

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      expect(responses.every(r => !r.isError)).toBe(true);

      // Should not take more than 2x single request time
      expect(totalTime).toBeLessThan(4000);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during extended operation', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform many operations
      for (let i = 0; i < 100; i++) {
        await client.callTool({
          name: 'list-compute-instances',
          arguments: { projectId: 'test-project' },
        });
      }

      // Force garbage collection
      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (< 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });
});
```

### Load Testing

**Stress Test Configuration:**

```typescript
describe('Load Tests', () => {
  describe('High Volume Scenarios', () => {
    it('should handle sustained load', async () => {
      const duration = 30000; // 30 seconds
      const requestsPerSecond = 10;
      const totalRequests = (duration / 1000) * requestsPerSecond;

      const startTime = Date.now();
      let completedRequests = 0;
      let errorCount = 0;

      const interval = setInterval(async () => {
        try {
          await client.callTool({
            name: 'list-compute-instances',
            arguments: { projectId: 'test-project' },
          });
          completedRequests++;
        } catch (error) {
          errorCount++;
        }
      }, 1000 / requestsPerSecond);

      // Wait for test duration
      await new Promise(resolve => setTimeout(resolve, duration));
      clearInterval(interval);

      const actualDuration = Date.now() - startTime;
      const successRate = (completedRequests / totalRequests) * 100;

      expect(successRate).toBeGreaterThan(95); // 95% success rate
      expect(errorCount).toBeLessThan(totalRequests * 0.05); // < 5% errors
    });
  });
});
```

## Test Data Management

### Fixtures and Mock Data

**Test Data Factory:**

```typescript
export class TestDataFactory {
  static createComputeInstance(overrides = {}) {
    return {
      name: 'test-instance',
      zone: 'us-central1-a',
      status: 'RUNNING',
      machineType: 'e2-medium',
      networkInterfaces: [
        {
          network: 'projects/test-project/global/networks/default',
          accessConfigs: [{ type: 'ONE_TO_ONE_NAT' }],
        },
      ],
      disks: [
        {
          boot: true,
          deviceName: 'persistent-disk-0',
          source: 'projects/test-project/zones/us-central1-a/disks/test-disk',
        },
      ],
      creationTimestamp: '2024-01-01T00:00:00.000-00:00',
      ...overrides,
    };
  }

  static createStorageBucket(overrides = {}) {
    return {
      name: 'test-bucket',
      location: 'US',
      storageClass: 'STANDARD',
      versioning: { enabled: false },
      creationTime: '2024-01-01T00:00:00.000Z',
      ...overrides,
    };
  }

  static createBigQueryDataset(overrides = {}) {
    return {
      datasetReference: {
        datasetId: 'test_dataset',
        projectId: 'test-project',
      },
      location: 'US',
      creationTime: '1609459200000',
      lastModifiedTime: '1609459200000',
      ...overrides,
    };
  }
}
```

### Environment Setup

**Test Environment Configuration:**

```typescript
// tests/helpers/test-setup.ts
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Global test setup
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';

  // Mock GCP credentials for unit tests
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = '/tmp/fake-credentials.json';
  }
});

// Global test teardown
afterAll(() => {
  // Cleanup any global resources
});

// Increase timeout for integration tests
jest.setTimeout(30000);
```

## Test Execution

### Running Tests

**Development Commands:**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only e2e tests
npm run test:e2e

# Run performance tests
npm run test:performance
```

**CI/CD Test Pipeline:**

```bash
# Fast feedback loop
npm run test:unit

# Full test suite
npm run test:coverage
npm run test:integration
npm run test:e2e

# Performance validation
npm run test:performance
```

### Test Configuration Files

**Package.json Scripts:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "jest tests/e2e",
    "test:performance": "jest tests/e2e/performance",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

**Environment Files:**

`.env.test`:

```bash
NODE_ENV=test
LOG_LEVEL=error
TEST_GCP_PROJECT_ID=test-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/test/credentials.json
```

## Quality Gates

### Coverage Requirements

**Minimum Coverage Thresholds:**

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/tools/': {
      branches: 85,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
};
```

### Performance Gates

**Response Time Thresholds:**

```javascript
const performanceGates = {
  maxResponseTime: {
    'list-compute-instances': 2000,
    'list-storage-buckets': 1500,
    'query-bigquery': 5000,
    'list-projects': 1000,
  },
  maxMemoryUsage: 100 * 1024 * 1024, // 100MB
  minSuccessRate: 0.95, // 95%
};
```

## Debugging Tests

### Debug Configuration

**VSCode Launch Configuration:**

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen",
  "env": {
    "NODE_ENV": "test"
  }
}
```

### Test Debugging Commands

```bash
# Debug specific test file
npx jest tests/unit/tools/compute.test.ts --runInBand

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Verbose output
npm test -- --verbose

# Show test names only
npm test -- --listTests
```

## Continuous Integration

### GitHub Actions Test Workflow

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
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

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        env:
          GOOGLE_APPLICATION_CREDENTIALS: ${{ secrets.GCP_CREDENTIALS }}
          TEST_GCP_PROJECT_ID: ${{ secrets.TEST_PROJECT_ID }}

      - name: Run e2e tests
        run: npm run test:e2e
        env:
          GOOGLE_APPLICATION_CREDENTIALS: ${{ secrets.GCP_CREDENTIALS }}
          TEST_GCP_PROJECT_ID: ${{ secrets.TEST_PROJECT_ID }}

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true
```

## Best Practices

### Test Writing Guidelines

1. **Descriptive Test Names**: Use clear, descriptive names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification phases
3. **Single Responsibility**: Each test should verify one specific behavior
4. **Independent Tests**: Tests should not depend on each other or external state
5. **Meaningful Assertions**: Use specific assertions that clearly communicate intent

### Mock Strategy

1. **Mock External Dependencies**: Always mock GCP clients and external APIs
2. **Test Real Logic**: Don't mock the code you're testing
3. **Realistic Mocks**: Make mocks behave like real services
4. **Mock Verification**: Verify that mocks are called correctly

### Performance Testing Guidelines

1. **Baseline Measurements**: Establish performance baselines for all tools
2. **Realistic Scenarios**: Test with realistic data volumes and request patterns
3. **Resource Monitoring**: Monitor CPU, memory, and network usage during tests
4. **Gradual Load**: Increase load gradually to identify breaking points

For testing support and advanced scenarios, see the [development guide](DEVELOPMENT.md) or [open an issue](https://github.com/startupmanch/gcp-mcp-server/issues).
