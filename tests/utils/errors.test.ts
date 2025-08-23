/**
 * Unit tests for error utilities
 */

import { describe, it, expect } from '@jest/globals';

// Mock error classes based on expected error utilities
class MCPError extends Error {
  public code: string;
  public statusCode?: number;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode?: number) {
    super(message);
    this.name = 'MCPError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

class GCPError extends MCPError {
  constructor(message: string, code: string = 'GCP_ERROR', statusCode?: number) {
    super(message, code, statusCode);
    this.name = 'GCPError';
  }
}

class AuthenticationError extends MCPError {
  constructor(message: string) {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

class PermissionError extends MCPError {
  constructor(message: string) {
    super(message, 'PERMISSION_ERROR', 403);
    this.name = 'PermissionError';
  }
}

class ConfigurationError extends MCPError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR', 400);
    this.name = 'ConfigurationError';
  }
}

// Helper functions
const createErrorFromGCPError = (gcpError: any): MCPError => {
  if (gcpError.code === 'UNAUTHENTICATED' || gcpError.code === 401) {
    return new AuthenticationError(gcpError.message);
  }

  if (gcpError.code === 'PERMISSION_DENIED' || gcpError.code === 403) {
    return new PermissionError(gcpError.message);
  }

  return new GCPError(gcpError.message, gcpError.code, gcpError.status);
};

const isRetryableError = (error: Error): boolean => {
  if (error instanceof GCPError) {
    // Retry on temporary failures
    return (
      ['DEADLINE_EXCEEDED', 'UNAVAILABLE', 'INTERNAL'].includes(error.code) ||
      [500, 502, 503, 504].includes(error.statusCode || 0)
    );
  }
  return false;
};

describe('Error Utilities', () => {
  describe('MCPError', () => {
    it('should create basic MCP error with message', () => {
      const error = new MCPError('Test error message');

      expect(error.message).toBe('Test error message');
      expect(error.name).toBe('MCPError');
      expect(error.code).toBe('UNKNOWN_ERROR');
      expect(error.statusCode).toBeUndefined();
      expect(error instanceof Error).toBe(true);
    });

    it('should create MCP error with custom code', () => {
      const error = new MCPError('Custom error', 'CUSTOM_CODE');

      expect(error.message).toBe('Custom error');
      expect(error.code).toBe('CUSTOM_CODE');
    });

    it('should create MCP error with status code', () => {
      const error = new MCPError('HTTP error', 'HTTP_ERROR', 400);

      expect(error.message).toBe('HTTP error');
      expect(error.code).toBe('HTTP_ERROR');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('GCPError', () => {
    it('should create GCP error with default code', () => {
      const error = new GCPError('GCP operation failed');

      expect(error.message).toBe('GCP operation failed');
      expect(error.name).toBe('GCPError');
      expect(error.code).toBe('GCP_ERROR');
      expect(error instanceof MCPError).toBe(true);
    });

    it('should create GCP error with custom code and status', () => {
      const error = new GCPError('Quota exceeded', 'QUOTA_EXCEEDED', 429);

      expect(error.message).toBe('Quota exceeded');
      expect(error.code).toBe('QUOTA_EXCEEDED');
      expect(error.statusCode).toBe(429);
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error with 401 status', () => {
      const error = new AuthenticationError('Invalid credentials');

      expect(error.message).toBe('Invalid credentials');
      expect(error.name).toBe('AuthenticationError');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.statusCode).toBe(401);
      expect(error instanceof MCPError).toBe(true);
    });
  });

  describe('PermissionError', () => {
    it('should create permission error with 403 status', () => {
      const error = new PermissionError('Access denied');

      expect(error.message).toBe('Access denied');
      expect(error.name).toBe('PermissionError');
      expect(error.code).toBe('PERMISSION_ERROR');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('ConfigurationError', () => {
    it('should create configuration error with 400 status', () => {
      const error = new ConfigurationError('Missing required config');

      expect(error.message).toBe('Missing required config');
      expect(error.name).toBe('ConfigurationError');
      expect(error.code).toBe('CONFIGURATION_ERROR');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('createErrorFromGCPError', () => {
    it('should convert UNAUTHENTICATED to AuthenticationError', () => {
      const gcpError = { message: 'Auth failed', code: 'UNAUTHENTICATED' };
      const error = createErrorFromGCPError(gcpError);

      expect(error instanceof AuthenticationError).toBe(true);
      expect(error.message).toBe('Auth failed');
    });

    it('should convert 401 status to AuthenticationError', () => {
      const gcpError = { message: 'Unauthorized', code: 401 };
      const error = createErrorFromGCPError(gcpError);

      expect(error instanceof AuthenticationError).toBe(true);
      expect(error.message).toBe('Unauthorized');
    });

    it('should convert PERMISSION_DENIED to PermissionError', () => {
      const gcpError = { message: 'No access', code: 'PERMISSION_DENIED' };
      const error = createErrorFromGCPError(gcpError);

      expect(error instanceof PermissionError).toBe(true);
      expect(error.message).toBe('No access');
    });

    it('should convert 403 status to PermissionError', () => {
      const gcpError = { message: 'Forbidden', code: 403 };
      const error = createErrorFromGCPError(gcpError);

      expect(error instanceof PermissionError).toBe(true);
      expect(error.message).toBe('Forbidden');
    });

    it('should convert other errors to GCPError', () => {
      const gcpError = { message: 'Server error', code: 'INTERNAL', status: 500 };
      const error = createErrorFromGCPError(gcpError);

      expect(error instanceof GCPError).toBe(true);
      expect(error.message).toBe('Server error');
      expect(error.code).toBe('INTERNAL');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable GCP errors by code', () => {
      const deadlineError = new GCPError('Timeout', 'DEADLINE_EXCEEDED');
      const unavailableError = new GCPError('Service down', 'UNAVAILABLE');
      const internalError = new GCPError('Internal error', 'INTERNAL');

      expect(isRetryableError(deadlineError)).toBe(true);
      expect(isRetryableError(unavailableError)).toBe(true);
      expect(isRetryableError(internalError)).toBe(true);
    });

    it('should identify retryable GCP errors by status code', () => {
      const serverError = new GCPError('Server error', 'SERVER_ERROR', 500);
      const badGateway = new GCPError('Bad gateway', 'BAD_GATEWAY', 502);
      const serviceUnavailable = new GCPError('Service unavailable', 'SERVICE_UNAVAILABLE', 503);
      const gatewayTimeout = new GCPError('Gateway timeout', 'GATEWAY_TIMEOUT', 504);

      expect(isRetryableError(serverError)).toBe(true);
      expect(isRetryableError(badGateway)).toBe(true);
      expect(isRetryableError(serviceUnavailable)).toBe(true);
      expect(isRetryableError(gatewayTimeout)).toBe(true);
    });

    it('should not retry non-retryable errors', () => {
      const authError = new AuthenticationError('Invalid token');
      const permissionError = new PermissionError('Access denied');
      const configError = new ConfigurationError('Bad config');
      const clientError = new GCPError('Bad request', 'INVALID_ARGUMENT', 400);

      expect(isRetryableError(authError)).toBe(false);
      expect(isRetryableError(permissionError)).toBe(false);
      expect(isRetryableError(configError)).toBe(false);
      expect(isRetryableError(clientError)).toBe(false);
    });

    it('should not retry non-GCP errors', () => {
      const regularError = new Error('Regular error');
      const mcpError = new MCPError('MCP error');

      expect(isRetryableError(regularError)).toBe(false);
      expect(isRetryableError(mcpError)).toBe(false);
    });
  });

  describe('Error Inheritance', () => {
    it('should maintain proper inheritance chain', () => {
      const gcpError = new GCPError('Test');
      const authError = new AuthenticationError('Test');
      const permError = new PermissionError('Test');
      const configError = new ConfigurationError('Test');

      expect(gcpError instanceof Error).toBe(true);
      expect(gcpError instanceof MCPError).toBe(true);
      expect(gcpError instanceof GCPError).toBe(true);

      expect(authError instanceof Error).toBe(true);
      expect(authError instanceof MCPError).toBe(true);
      expect(authError instanceof AuthenticationError).toBe(true);

      expect(permError instanceof Error).toBe(true);
      expect(permError instanceof MCPError).toBe(true);
      expect(permError instanceof PermissionError).toBe(true);

      expect(configError instanceof Error).toBe(true);
      expect(configError instanceof MCPError).toBe(true);
      expect(configError instanceof ConfigurationError).toBe(true);
    });
  });
});
