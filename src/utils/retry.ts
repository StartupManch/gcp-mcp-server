/**
 * Retry utility for handling transient failures
 */

export interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  exponentialBackoff?: boolean;
}

export interface RetryState {
  attempt: number;
  lastError?: Error;
}

/**
 * Executes a function with retry logic
 * @param fn Function to execute
 * @param options Retry configuration options
 * @returns Promise resolving to the function's result
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxRetries = 3, delay = 1000, exponentialBackoff = false } = options;

  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay
      const retryDelay = exponentialBackoff ? delay * Math.pow(2, attempt) : delay;

      // Wait before retrying
      if (retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  // Throw the last error
  throw lastError;
}

/**
 * Creates a retryable version of a function
 * @param fn Function to make retryable
 * @param options Default retry options
 * @returns Retryable function
 */
export function makeRetryable<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  options: RetryOptions = {}
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    return withRetry(() => fn(...args), options);
  };
}

/**
 * Checks if an error is retryable
 * @param error Error to check
 * @returns True if the error should be retried
 */
export function isRetryableError(error: unknown): boolean {
  if (!error) return false;

  // Type guard to check if error has expected properties
  const hasCode = (err: unknown): err is { code: string } => {
    return typeof err === 'object' && err !== null && 'code' in err;
  };

  const hasStatus = (err: unknown): err is { status: number } => {
    return typeof err === 'object' && err !== null && 'status' in err;
  };

  const hasMessage = (err: unknown): err is { message: string } => {
    return typeof err === 'object' && err !== null && 'message' in err;
  };

  // Network errors are typically retryable
  if (
    hasCode(error) &&
    (error.code === 'ECONNRESET' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT')
  ) {
    return true;
  }

  // HTTP status codes that are retryable
  if (hasStatus(error)) {
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    return retryableStatusCodes.includes(error.status);
  }

  // GCP API specific errors
  if (hasMessage(error)) {
    const retryableMessages = [
      'timeout',
      'rate limit',
      'quota exceeded',
      'service unavailable',
      'internal error',
    ];

    const message = error.message.toLowerCase();
    return retryableMessages.some(msg => message.includes(msg));
  }

  return false;
}

/**
 * Conditional retry - only retries if the error is retryable
 * @param fn Function to execute
 * @param options Retry options
 * @returns Promise resolving to the function's result
 */
export async function withConditionalRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000, exponentialBackoff = false } = options;

  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if error is not retryable or on last attempt
      if (!isRetryableError(error) || attempt === maxRetries) {
        break;
      }

      // Calculate delay
      const retryDelay = exponentialBackoff ? delay * Math.pow(2, attempt) : delay;

      // Wait before retrying
      if (retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  // Throw the last error
  throw lastError;
}
