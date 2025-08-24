/**
 * Integration tests for the complete GCP MCP Server workflow
 */

import { describe, it, expect } from '@jest/globals';

describe('GCP MCP Server Integration', () => {
  describe('Tool Discovery', () => {
    it('should export tool definitions', () => {
      // Dynamic import to avoid TypeScript issues
      const tools = require('../src/tools');

      expect(tools).toBeDefined();
      expect(typeof tools).toBe('object');
    });

    it('should export handler classes', () => {
      const tools = require('../src/tools');

      expect(tools.GCPToolHandlers).toBeDefined();
      expect(typeof tools.GCPToolHandlers).toBe('function');
    });
  });

  describe('Configuration Validation', () => {
    it('should have valid configuration structure', () => {
      const config = require('../src/config');

      expect(config.CONFIG).toBeDefined();
      expect(config.CONFIG.SERVER).toBeDefined();
      expect(config.CONFIG.DEFAULTS).toBeDefined();
      expect(config.CONFIG.REGIONS).toBeDefined();
    });

    it('should export zone utility function', () => {
      const config = require('../src/config');

      expect(config.getZonesForRegion).toBeDefined();
      expect(typeof config.getZonesForRegion).toBe('function');
    });
  });

  describe('Utility Functions', () => {
    it('should export required utilities', () => {
      const utils = require('../src/utils');

      expect(utils.logger).toBeDefined();
      expect(utils.stateManager).toBeDefined();
      expect(utils.withRetry).toBeDefined();
    });

    it('should have error handling utilities', () => {
      try {
        const errors = require('../src/utils/errors');

        expect(errors.GCPMCPError).toBeDefined();
        expect(errors.withRetry).toBeDefined();
      } catch (error) {
        // If module doesn't exist or export is missing, mark as failing
        console.warn('Error utilities not properly exported:', error);
        expect(false).toBe(true); // Force failure for now
      }
    });
  });

  describe('Server Initialization', () => {
    it('should export server class', () => {
      const server = require('../src/server');

      expect(server.GCPMCPServer).toBeDefined();
      expect(typeof server.GCPMCPServer).toBe('function');
    });
  });

  describe('Type Definitions', () => {
    it('should export type definitions', () => {
      const types = require('../src/types');

      expect(types).toBeDefined();
      expect(typeof types).toBe('object');
    });
  });

  describe('Module Structure', () => {
    it('should have consistent module exports', () => {
      // Test that main modules can be imported without errors
      expect(() => require('../src/config')).not.toThrow();
      expect(() => require('../src/server')).not.toThrow();
      expect(() => require('../src/tools')).not.toThrow();
      expect(() => require('../src/utils')).not.toThrow();
      expect(() => require('../src/types')).not.toThrow();
    });
  });

  describe('Package Integrity', () => {
    it('should have correct package.json structure', () => {
      const pkg = require('../package.json');

      expect(pkg.name).toBe('gcp-mcp-server');
      expect(pkg.version).toBeDefined();
      expect(pkg.main).toBeDefined();
      expect(pkg.scripts).toBeDefined();
      expect(pkg.dependencies).toBeDefined();
    });

    it('should have required dependencies', () => {
      const pkg = require('../package.json');

      // Check for essential GCP dependencies
      expect(pkg.dependencies['@google-cloud/compute']).toBeDefined();
      expect(pkg.dependencies['@google-cloud/storage']).toBeDefined();
      expect(pkg.dependencies['@google-cloud/bigquery']).toBeDefined();
      expect(pkg.dependencies['@modelcontextprotocol/sdk']).toBeDefined();
    });
  });
});
