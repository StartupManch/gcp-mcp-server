/**
 * Error handling utilities
 */

import { logger } from './logger';

export class GCPMCPError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'GCPMCPError';
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      logger.warn(`Attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw new GCPMCPError(`Operation failed after ${maxRetries} attempts`, 'MAX_RETRIES_EXCEEDED', {
    originalError: lastError,
  });
}

export function handleError(error: unknown, operation: string): never {
  if (error instanceof GCPMCPError) {
    throw error;
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  logger.error(`Error in ${operation}:`, error as Error);

  throw new GCPMCPError(`Failed to ${operation}: ${errorMessage}`, 'OPERATION_FAILED', {
    originalError: error,
  });
}
