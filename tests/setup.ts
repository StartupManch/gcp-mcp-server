/**
 * Jest test setup file
 * Configures global test environment and mocks
 */

import { jest } from '@jest/globals';

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce logging during tests

// Mock Google Cloud credentials
process.env.GOOGLE_APPLICATION_CREDENTIALS = '/mock/path/to/credentials.json';

// Global test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global setup for all tests
beforeAll(() => {
  // Any global setup needed
});

afterAll(() => {
  // Global cleanup
});
