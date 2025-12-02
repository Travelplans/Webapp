/**
 * API Client with retry logic and error handling
 */

import { logger } from './logger';
import { handleError } from './errorHandler';

interface RequestOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

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
 * Enhanced fetch with retry logic and error handling
 */
export const apiRequest = async <T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { retries = 3, retryDelay = 1000, ...fetchOptions } = options;

  const makeRequest = async (): Promise<T> => {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  try {
    const data = await retry(makeRequest, retries, retryDelay);
    return data;
  } catch (error) {
    const errorDetails = handleError(error);
    logger.error('API request failed', { url, error: errorDetails });
    throw error;
  }
};

