import { withRetry } from '../../src/utils/index';

describe('Retry Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withRetry function', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = jest.fn();
      mockFn.mockResolvedValue('success');

      const result = await withRetry(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockFn = jest.fn();
      mockFn
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce('success');

      const result = await withRetry(mockFn, 3, 10);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const mockFn = jest.fn();
      mockFn.mockRejectedValue(new Error('Persistent failure'));

      await expect(withRetry(mockFn, 2, 10)).rejects.toThrow('Operation failed after 2 attempts');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should use default retry options', async () => {
      const mockFn = jest.fn();
      mockFn.mockRejectedValue(new Error('Default test'));

      await expect(withRetry(mockFn)).rejects.toThrow('Operation failed after 3 attempts');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should respect custom retry count', async () => {
      const mockFn = jest.fn();
      mockFn.mockRejectedValueOnce(new Error('Retry test')).mockResolvedValueOnce('success');

      const result = await withRetry(mockFn, 1, 10);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should handle functions that return undefined', async () => {
      const mockFn = jest.fn();
      mockFn.mockResolvedValue(undefined);

      const result = await withRetry(mockFn);

      expect(result).toBeUndefined();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle delay between retries', async () => {
      const mockFn = jest.fn();
      mockFn.mockResolvedValueOnce('success');

      const startTime = Date.now();
      const result = await withRetry(mockFn, 3, 50);
      const endTime = Date.now();

      expect(result).toBe('success');
      expect(endTime - startTime).toBeLessThan(100); // No delay on success
    });

    it('should handle delay on retries', async () => {
      const mockFn = jest.fn();
      mockFn.mockRejectedValueOnce(new Error('Delay test')).mockResolvedValueOnce('success');

      const startTime = Date.now();
      const result = await withRetry(mockFn, 1, 50);
      const endTime = Date.now();

      expect(result).toBe('success');
      expect(endTime - startTime).toBeGreaterThan(40); // Should have some delay
    });

    it('should preserve original error information in GCPMCPError', async () => {
      const originalError = new Error('Original error message');
      originalError.stack = 'Original stack trace';

      const mockFn = jest.fn();
      mockFn.mockRejectedValue(originalError);

      try {
        await withRetry(mockFn, 1, 10);
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain('Operation failed after 1 attempts');
        expect(error.details?.originalError).toBe(originalError);
      }
    });

    it('should handle non-Error rejections', async () => {
      const mockFn = jest.fn();
      mockFn.mockRejectedValue('String error');

      await expect(withRetry(mockFn, 1, 10)).rejects.toThrow('Operation failed after 1 attempts');
    });

    it('should handle null rejections', async () => {
      const mockFn = jest.fn();
      mockFn.mockRejectedValue(null);

      await expect(withRetry(mockFn, 1, 10)).rejects.toThrow('Operation failed after 1 attempts');
    });

    it('should handle successful functions with no retry needed', async () => {
      const mockFn = jest.fn();
      mockFn.mockResolvedValue('immediate success');

      const result = await withRetry(mockFn, 5, 100);

      expect(result).toBe('immediate success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent retry operations', async () => {
      const mockFn = jest.fn();
      mockFn.mockResolvedValue('success');

      const promises = Array(5)
        .fill(0)
        .map(() => withRetry(mockFn));
      const results = await Promise.all(promises);

      expect(results.every(r => r === 'success')).toBe(true);
      expect(mockFn).toHaveBeenCalledTimes(5);
    });

    it('should use progressive delay for retries', async () => {
      const mockFn = jest.fn();
      mockFn
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce('success');

      const startTime = Date.now();
      const result = await withRetry(mockFn, 3, 20);
      const endTime = Date.now();

      expect(result).toBe('success');
      // First retry: 20ms, second retry: 40ms = 60ms minimum
      expect(endTime - startTime).toBeGreaterThan(50);
    });
  });
});
