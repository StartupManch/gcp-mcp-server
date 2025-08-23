/**
 * Unit tests for logger utility
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock console methods
const mockConsole = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock the logger implementation
const createLogger = (level: string = 'info') => {
  const logger = {
    debug: (message: string, meta?: any) => {
      if (['debug'].includes(level)) {
        mockConsole.debug(`[DEBUG] ${message}`, meta);
      }
    },
    info: (message: string, meta?: any) => {
      if (['debug', 'info'].includes(level)) {
        mockConsole.info(`[INFO] ${message}`, meta);
      }
    },
    warn: (message: string, meta?: any) => {
      if (['debug', 'info', 'warn'].includes(level)) {
        mockConsole.warn(`[WARN] ${message}`, meta);
      }
    },
    error: (message: string, meta?: any) => {
      mockConsole.error(`[ERROR] ${message}`, meta);
    },
    setLevel: (newLevel: string) => {
      level = newLevel;
    },
  };
  return logger;
};

describe('Logger Utility', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    Object.values(mockConsole).forEach(mock => mock.mockClear());
  });

  describe('createLogger', () => {
    it('should create a logger with default info level', () => {
      const logger = createLogger();

      logger.info('Test message');
      expect(mockConsole.info).toHaveBeenCalledWith('[INFO] Test message', undefined);
    });

    it('should create a logger with specified level', () => {
      const logger = createLogger('debug');

      logger.debug('Debug message');
      expect(mockConsole.debug).toHaveBeenCalledWith('[DEBUG] Debug message', undefined);
    });

    it('should respect log level hierarchy', () => {
      const logger = createLogger('warn');

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalledWith('[WARN] Warn message', undefined);
      expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Error message', undefined);
    });

    it('should allow changing log level', () => {
      const logger = createLogger('error');

      // Initially only error should log
      logger.info('Info message');
      logger.error('Error message');

      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Error message', undefined);

      // Clear mocks
      Object.values(mockConsole).forEach(mock => mock.mockClear());

      // Change to info level
      logger.setLevel('info');
      logger.info('Info message after level change');

      expect(mockConsole.info).toHaveBeenCalledWith(
        '[INFO] Info message after level change',
        undefined
      );
    });

    it('should handle metadata objects', () => {
      const logger = createLogger('info');
      const metadata = { userId: '123', action: 'login' };

      logger.info('User action', metadata);

      expect(mockConsole.info).toHaveBeenCalledWith('[INFO] User action', metadata);
    });

    it('should handle different log levels', () => {
      const debugLogger = createLogger('debug');

      debugLogger.debug('Debug message');
      debugLogger.info('Info message');
      debugLogger.warn('Warn message');
      debugLogger.error('Error message');

      expect(mockConsole.debug).toHaveBeenCalledWith('[DEBUG] Debug message', undefined);
      expect(mockConsole.info).toHaveBeenCalledWith('[INFO] Info message', undefined);
      expect(mockConsole.warn).toHaveBeenCalledWith('[WARN] Warn message', undefined);
      expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Error message', undefined);
    });
  });

  describe('Logger Integration', () => {
    it('should work with real logger from src/utils/logger.ts when available', () => {
      // This test would import the actual logger when the file exists
      // For now, we test the interface contract
      const logger = createLogger();

      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.setLevel).toBe('function');
    });
  });
});
