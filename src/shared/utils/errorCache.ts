/**
 * Error Cache System
 * Caches errors to prevent repeated error messages and improve UX
 */

interface CachedError {
  error: Error;
  timestamp: number;
  count: number;
  userMessage: string;
}

interface ErrorCacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  maxErrors?: number; // Maximum number of cached errors (default: 50)
}

class ErrorCache {
  private cache: Map<string, CachedError> = new Map();
  private options: Required<ErrorCacheOptions>;

  constructor(options: ErrorCacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxErrors: options.maxErrors || 50,
    };
  }

  /**
   * Generate a cache key from error
   */
  private getCacheKey(error: Error | unknown): string {
    if (error instanceof Error) {
      // Use error message and stack trace (first 100 chars) as key
      const stack = error.stack?.substring(0, 100) || '';
      return `${error.name}:${error.message}:${stack}`;
    }
    return `Unknown:${String(error)}`;
  }

  /**
   * Check if error is cached and should be suppressed
   */
  shouldSuppressError(error: Error | unknown): boolean {
    const key = this.getCacheKey(error);
    const cached = this.cache.get(key);

    if (!cached) {
      return false;
    }

    // Check if cache entry is still valid
    const now = Date.now();
    if (now - cached.timestamp > this.options.ttl) {
      this.cache.delete(key);
      return false;
    }

    // Suppress if same error occurred recently (within last 30 seconds)
    const recentThreshold = 30 * 1000; // 30 seconds
    return (now - cached.timestamp) < recentThreshold;
  }

  /**
   * Cache an error
   */
  cacheError(error: Error | unknown, userMessage: string): void {
    const key = this.getCacheKey(error);
    const now = Date.now();

    // Clean up expired entries if cache is getting large
    if (this.cache.size >= this.options.maxErrors) {
      this.cleanup();
    }

    const existing = this.cache.get(key);
    if (existing) {
      // Update existing entry
      existing.count += 1;
      existing.timestamp = now;
      existing.userMessage = userMessage;
    } else {
      // Create new entry
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.cache.set(key, {
        error: errorObj,
        timestamp: now,
        count: 1,
        userMessage,
      });
    }
  }

  /**
   * Get cached error information
   */
  getCachedError(error: Error | unknown): CachedError | null {
    const key = this.getCacheKey(error);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check if cache entry is still valid
    const now = Date.now();
    if (now - cached.timestamp > this.options.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached;
  }

  /**
   * Get error count for a specific error
   */
  getErrorCount(error: Error | unknown): number {
    const cached = this.getCachedError(error);
    return cached?.count || 0;
  }

  /**
   * Clear expired entries from cache
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.options.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached errors
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get all cached errors (for debugging)
   */
  getAllErrors(): CachedError[] {
    this.cleanup();
    return Array.from(this.cache.values());
  }

  /**
   * Get cache statistics
   */
  getStats(): { total: number; oldest: number | null; newest: number | null } {
    this.cleanup();
    const errors = Array.from(this.cache.values());
    
    if (errors.length === 0) {
      return { total: 0, oldest: null, newest: null };
    }

    const timestamps = errors.map(e => e.timestamp);
    return {
      total: errors.length,
      oldest: Math.min(...timestamps),
      newest: Math.max(...timestamps),
    };
  }
}

// Singleton instance
export const errorCache = new ErrorCache();

/**
 * Check if error should be shown to user (not suppressed)
 */
export const shouldShowError = (error: Error | unknown): boolean => {
  return !errorCache.shouldSuppressError(error);
};

/**
 * Cache an error and return whether it should be shown
 */
export const cacheAndCheckError = (
  error: Error | unknown,
  userMessage: string
): { shouldShow: boolean; count: number } => {
  const cached = errorCache.getCachedError(error);
  const count = cached?.count || 0;

  // If error occurred recently (within 30 seconds), suppress it
  if (count > 0 && cached) {
    const timeSinceLastError = Date.now() - cached.timestamp;
    if (timeSinceLastError < 30 * 1000) {
      return { shouldShow: false, count: count + 1 };
    }
  }

  // Cache the error
  errorCache.cacheError(error, userMessage);
  return { shouldShow: true, count: 1 };
};

export default errorCache;
