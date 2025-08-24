import { withRetry, RetryOptions } from '../../src/utils/retry';

describe('Retry Utility', () => {
  describe('withRetry function', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      const result = await withRetry(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success');

      const result = await withRetry(mockFn, { maxRetries: 3, delay: 10 });

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('persistent failure'));

      await expect(withRetry(mockFn, { maxRetries: 2, delay: 10 })).rejects.toThrow(
        'persistent failure'
      );
      expect(mockFn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });

    it('should use default retry options', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('failure'));

      const startTime = Date.now();
      await expect(withRetry(mockFn)).rejects.toThrow('failure');
      const endTime = Date.now();

      expect(mockFn).toHaveBeenCalledTimes(4); // 1 initial + 3 retries (default)
      expect(endTime - startTime).toBeGreaterThan(3000); // Should have delay
    });

    it('should respect custom retry count', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('failure'));

      await expect(withRetry(mockFn, { maxRetries: 1 })).rejects.toThrow('failure');
      expect(mockFn).toHaveBeenCalledTimes(2); // 1 initial + 1 retry
    });

    it('should handle functions that return undefined', async () => {
      const mockFn = jest.fn().mockResolvedValue(undefined);

      const result = await withRetry(mockFn);

      expect(result).toBeUndefined();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle delay between retries', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      const startTime = Date.now();
      const result = await withRetry(mockFn, { maxRetries: 2, delay: 100 });
      const endTime = Date.now();

      expect(result).toBe('success');
      expect(endTime - startTime).toBeGreaterThan(90); // Should have delay
    });

    it('should handle exponential backoff', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success');

      const startTime = Date.now();
      const result = await withRetry(mockFn, {
        maxRetries: 3,
        delay: 50,
        exponentialBackoff: true,
      });
      const endTime = Date.now();

      expect(result).toBe('success');
      expect(endTime - startTime).toBeGreaterThan(140); // 50 + 100 + processing time
    });

    it('should handle zero delay', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      const result = await withRetry(mockFn, { maxRetries: 2, delay: 0 });

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should handle non-Error rejections', async () => {
      const mockFn = jest.fn().mockRejectedValue('string error');

      await expect(withRetry(mockFn, { maxRetries: 1, delay: 10 })).rejects.toBe('string error');
    });

    it('should handle null rejections', async () => {
      const mockFn = jest.fn().mockRejectedValue(null);

      await expect(withRetry(mockFn, { maxRetries: 1, delay: 10 })).rejects.toBeNull();
    });

    it('should handle successful functions with no retry needed', async () => {
      const mockFn = jest.fn().mockResolvedValue(42);

      const result = await withRetry(mockFn, { maxRetries: 5 });

      expect(result).toBe(42);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent retry operations', async () => {
      const mockFn1 = jest.fn().mockResolvedValue('result1');
      const mockFn2 = jest.fn().mockResolvedValue('result2');

      const [result1, result2] = await Promise.all([withRetry(mockFn1), withRetry(mockFn2)]);

      expect(result1).toBe('result1');
      expect(result2).toBe('result2');
    });

    it('should use progressive delay for retries', async () => {
      const delays: number[] = [];
      const mockFn = jest.fn().mockImplementation(() => {
        delays.push(Date.now());
        throw new Error('failure');
      });

      await expect(withRetry(mockFn, { maxRetries: 2, delay: 50 })).rejects.toThrow('failure');

      // Should have delays between attempts (non-exponential)
      expect(delays.length).toBe(3); // 1 initial + 2 retries
      if (delays.length >= 2) {
        expect(delays[1] - delays[0]).toBeGreaterThan(40);
      }
    });
  });
});
