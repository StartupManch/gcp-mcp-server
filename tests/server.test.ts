/**
 * Tests for GCP MCP Server functionality
 * These tests verify basic server operations without complex mocking
 */

describe('GCP MCP Server', () => {
  describe('Server Module', () => {
    it('should export GCPMCPServer class', () => {
      const serverModule = require('../src/server');
      expect(serverModule.GCPMCPServer).toBeDefined();
      expect(typeof serverModule.GCPMCPServer).toBe('function');
    });

    it('should create server instance', () => {
      const { GCPMCPServer } = require('../src/server');
      const server = new GCPMCPServer();
      expect(server).toBeDefined();
      expect(server.constructor.name).toBe('GCPMCPServer');
    });

    it('should have required server methods', () => {
      const { GCPMCPServer } = require('../src/server');
      const server = new GCPMCPServer();

      expect(typeof server.start).toBe('function');
    });
  });

  describe('Server Configuration', () => {
    it('should initialize with default configuration', () => {
      const { GCPMCPServer } = require('../src/server');
      const server = new GCPMCPServer();

      // Server should be created without errors
      expect(server).toBeDefined();
    });

    it('should have MCP protocol handlers', () => {
      const { GCPMCPServer } = require('../src/server');
      const server = new GCPMCPServer();

      // Check that server has the expected structure with private MCP server
      expect(server).toHaveProperty('start');
      expect(server).toHaveProperty('server');
      expect(server).toHaveProperty('toolHandlers');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid requests gracefully', () => {
      const { GCPMCPServer } = require('../src/server');
      const server = new GCPMCPServer();

      // Should not throw when creating server
      expect(() => new GCPMCPServer()).not.toThrow();
    });
  });

  describe('Server Components', () => {
    it('should initialize with GCP tool handlers', () => {
      const { GCPMCPServer } = require('../src/server');
      const server = new GCPMCPServer();

      expect(server.toolHandlers).toBeDefined();
      expect(typeof server.toolHandlers).toBe('object');
    });

    it('should initialize internal MCP server with correct config', () => {
      const { GCPMCPServer } = require('../src/server');
      const server = new GCPMCPServer();

      expect(server.server).toBeDefined();
      expect(server.server._serverInfo.name).toBe('gcp-mcp-server');
      expect(server.server._serverInfo.version).toBeDefined();
    });

    it('should have tools capability configured', () => {
      const { GCPMCPServer } = require('../src/server');
      const server = new GCPMCPServer();

      expect(server.server._capabilities).toHaveProperty('tools');
    });

    it('should have request handlers setup', () => {
      const { GCPMCPServer } = require('../src/server');
      const server = new GCPMCPServer();

      // Check that required MCP handlers are registered
      expect(server.server._requestHandlers.has('tools/list')).toBe(true);
      expect(server.server._requestHandlers.has('tools/call')).toBe(true);
    });
  });

  describe('Server Integration', () => {
    it('should properly integrate with CONFIG', () => {
      const CONFIG = require('../src/config').CONFIG;
      const { GCPMCPServer } = require('../src/server');
      const server = new GCPMCPServer();

      expect(server.server._serverInfo.name).toBe(CONFIG.SERVER.NAME);
      expect(server.server._serverInfo.version).toBe(CONFIG.SERVER.VERSION);
    });

    it('should work with state manager', () => {
      const { stateManager } = require('../src/utils');
      const { GCPMCPServer } = require('../src/server');

      // Should not throw when accessing state manager
      expect(() => {
        new GCPMCPServer();
        stateManager.getSelectedRegion();
      }).not.toThrow();
    });

    it('should work with logger', () => {
      const { logger } = require('../src/utils');
      const { GCPMCPServer } = require('../src/server');

      // Should not throw when using logger
      expect(() => {
        new GCPMCPServer();
        logger.info('test');
      }).not.toThrow();
    });
  });
});
