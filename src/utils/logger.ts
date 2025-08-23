/**
 * Logging utilities for GCP MCP Server
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO;

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  debug(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.INFO) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  error(message: string, error?: Error, ...args: any[]): void {
    if (this.logLevel <= LogLevel.ERROR) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error, ...args);
    }
  }
}

export const logger = new Logger();

// Set log level from environment variable
const envLogLevel = process.env.LOG_LEVEL?.toLowerCase();
switch (envLogLevel) {
  case 'debug':
    logger.setLogLevel(LogLevel.DEBUG);
    break;
  case 'info':
    logger.setLogLevel(LogLevel.INFO);
    break;
  case 'warn':
    logger.setLogLevel(LogLevel.WARN);
    break;
  case 'error':
    logger.setLogLevel(LogLevel.ERROR);
    break;
  default:
    logger.setLogLevel(LogLevel.INFO);
}
