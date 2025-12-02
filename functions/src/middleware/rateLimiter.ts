/**
 * Rate limiting middleware for Firebase Functions
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

/**
 * Rate limiting middleware
 */
export const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || (Array.isArray(req.headers['x-forwarded-for']) 
    ? req.headers['x-forwarded-for'][0] 
    : req.headers['x-forwarded-for']) || 'unknown';
  const identifier = typeof ip === 'string' ? ip : 'unknown';
  const now = Date.now();

  // Clean up old entries
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });

  // Get or create entry for this identifier
  if (!store[identifier]) {
    store[identifier] = {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
  }

  const entry = store[identifier];

  // Reset if window expired
  if (entry.resetTime < now) {
    entry.count = 0;
    entry.resetTime = now + RATE_LIMIT_WINDOW;
  }

  // Check limit
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    });
    return;
  }

  // Increment counter
  entry.count++;

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW.toString());
  res.setHeader('X-RateLimit-Remaining', (MAX_REQUESTS_PER_WINDOW - entry.count).toString());
  res.setHeader('X-RateLimit-Reset', entry.resetTime.toString());

  next();
};

