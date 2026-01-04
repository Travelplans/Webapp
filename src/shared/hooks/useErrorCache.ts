/**
 * React hook for error cache management
 */

import { useState, useEffect, useCallback } from 'react';
import { errorCache, CachedError } from '../utils/errorCache';

export interface UseErrorCacheReturn {
  cachedErrors: CachedError[];
  stats: ReturnType<typeof errorCache.getStats>;
  clearCache: () => void;
  clearError: (url: string, method?: string) => void;
  refresh: () => void;
  isLoading: boolean;
}

/**
 * Hook to access and manage error cache
 */
export const useErrorCache = (autoRefresh: boolean = false, refreshInterval: number = 30000): UseErrorCacheReturn => {
  const [cachedErrors, setCachedErrors] = useState<CachedError[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof errorCache.getStats>>({
    total: 0,
    byCode: {},
    oldest: null,
    newest: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setIsLoading(true);
    try {
      const errors = errorCache.getAll();
      const errorStats = errorCache.getStats();
      setCachedErrors(errors);
      setStats(errorStats);
    } catch (error) {
      console.error('Error refreshing error cache:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCache = useCallback(() => {
    errorCache.clear();
    refresh();
  }, [refresh]);

  const clearError = useCallback((url: string, method?: string) => {
    errorCache.remove(url, method);
    refresh();
  }, [refresh]);

  useEffect(() => {
    // Initial load
    refresh();

    // Auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    cachedErrors,
    stats,
    clearCache,
    clearError,
    refresh,
    isLoading,
  };
};


