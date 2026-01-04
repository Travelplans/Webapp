/**
 * API Client with retry logic, error handling, authentication support, and error caching
 */

import { logger } from './logger';
import { handleError, ErrorDetails } from './errorHandler';
import { errorCache } from './errorCache';
import { auth } from '../../config/firebase';

interface RequestOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  requireAuth?: boolean; // Whether to require authentication token
  enableErrorCache?: boolean; // Whether to cache errors (default: true)
  errorCacheTTL?: number; // Custom TTL for error cache in milliseconds
}

// Track auth initialization state
let authReady = false;
let authReadyPromise: Promise<void> | null = null;

/**
 * Wait for authentication to be ready
 */
const waitForAuth = async (): Promise<void> => {
  if (authReady) return;
  
  if (!authReadyPromise) {
    authReadyPromise = new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(() => {
        authReady = true;
        resolve();
        unsubscribe();
      });
      
      // Timeout after 5 seconds if auth doesn't initialize
      setTimeout(() => {
        authReady = true;
        resolve();
      }, 5000);
    });
  }
  
  return authReadyPromise;
};

/**
 * Get authentication token for API requests
 */
const getAuthToken = async (forceRefresh: boolean = false): Promise<string | null> => {
  await waitForAuth();
  
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  
  try {
    // Force token refresh if requested or if token might be expired
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    logger.error('Error getting auth token', error);
    return null;
  }
};

/**
 * Retry a function with exponential backoff
 */
const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    logger.warn(`Request failed, retrying... (${retries} attempts left)`, error);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2);
  }
};

/**
 * Enhanced fetch with retry logic, error handling, authentication, and error caching
 */
export const apiRequest = async <T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { 
    retries = 3, 
    retryDelay = 1000, 
    requireAuth = false,
    enableErrorCache = true,
    errorCacheTTL,
    ...fetchOptions 
  } = options;

  const method = (fetchOptions.method || 'GET').toUpperCase();

  // Check if request should be blocked due to cached errors
  if (enableErrorCache && errorCache.shouldBlockRequest(url, method, fetchOptions)) {
    const cached = errorCache.get(url, method, fetchOptions);
    if (cached) {
      const errorDetails: ErrorDetails = {
        ...cached.error,
        message: `${cached.error.message} (Cached - ${cached.retryCount} previous failures)`,
      };
      logger.warn('Request blocked due to cached error', {
        url,
        method,
        error: cached.error.code,
        retryCount: cached.retryCount,
      });
      throw new Error(errorDetails.userMessage || errorDetails.message);
    }
  }

  // Wait for auth to be ready if authentication is required
  if (requireAuth) {
    await waitForAuth();
  }

  const makeRequest = async (isRetry: boolean = false): Promise<T> => {
    // Get auth token if required
    let token: string | null = null;
    if (requireAuth) {
      // Force refresh on retry (in case token expired)
      token = await getAuthToken(isRetry);
      
      if (!token) {
        // Redirect to login if no token available
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('User not authenticated');
      }
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    // Add Authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle 401 Unauthorized - try refreshing token once
    if (response.status === 401 && requireAuth && !isRetry) {
      logger.warn('[API] 401 Unauthorized, refreshing token and retrying...');
      
      // Try refreshing token and retrying
      const newToken = await getAuthToken(true);
      if (newToken) {
        // Retry request with new token
        const retryHeaders: HeadersInit = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newToken}`,
          ...fetchOptions.headers,
        };
        
        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers: retryHeaders,
        });
        
        if (retryResponse.ok) {
          return retryResponse.json();
        }
        
        // If still 401 after refresh, user is truly unauthorized
        if (retryResponse.status === 401) {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Unauthorized: Please login again');
        }
        
        const errorData = await retryResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
      } else {
        // No token available, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('User not authenticated');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorDetails = handleError(new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`));
      
      // Cache the error for future requests (unless it's a 401 which is auth-related)
      if (enableErrorCache && response.status !== 401) {
        errorCache.set(url, errorDetails, method, fetchOptions, errorCacheTTL);
      }
      
      // Handle 401 even if not explicitly requiring auth (for backward compatibility)
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Unauthorized: Please login again');
      }
      
      throw new Error(errorDetails.userMessage || errorDetails.message);
    }

    // Request succeeded - remove from error cache if it was cached
    if (enableErrorCache) {
      errorCache.remove(url, method, fetchOptions);
    }

    return response.json();
  };

  try {
    const data = await retry(() => makeRequest(false), retries, retryDelay);
    return data;
  } catch (error) {
    const errorDetails = handleError(error);
    
    // Cache network/timeout errors
    if (enableErrorCache) {
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
      const isTimeoutError = error instanceof Error && error.message.includes('timeout');
      
      if (isNetworkError || isTimeoutError) {
        const networkErrorDetails: ErrorDetails = {
          code: isNetworkError ? 'NETWORK_ERROR' : 'TIMEOUT',
          message: error instanceof Error ? error.message : 'Network error',
          userMessage: 'Network connection failed. Please check your internet connection.',
          statusCode: 0,
        };
        errorCache.set(url, networkErrorDetails, method, fetchOptions, errorCacheTTL);
      }
    }
    
    logger.error('API request failed', { url, error: errorDetails });
    throw error;
  }
};

/**
 * Clear error cache for a specific URL or all errors
 */
export const clearErrorCache = (url?: string, method?: string): void => {
  if (url) {
    errorCache.remove(url, method);
  } else {
    errorCache.clear();
  }
};

/**
 * Get error cache statistics
 */
export const getErrorCacheStats = () => {
  return errorCache.getStats();
};




