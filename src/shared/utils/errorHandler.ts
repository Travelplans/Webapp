/**
 * Centralized error handling
 * Provides consistent error handling across the application
 */

import { logger } from './logger';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export interface ErrorDetails {
  code: string;
  message: string;
  userMessage: string;
  statusCode?: number;
}

/**
 * Maps Firebase errors to user-friendly messages
 */
const getFirebaseErrorMessage = (error: any): ErrorDetails => {
  const code = error.code || 'unknown';
  
  const errorMap: Record<string, ErrorDetails> = {
    'auth/user-not-found': {
      code: 'USER_NOT_FOUND',
      message: 'User not found',
      userMessage: 'No account found with this email address.',
      statusCode: 404,
    },
    'auth/wrong-password': {
      code: 'WRONG_PASSWORD',
      message: 'Wrong password',
      userMessage: 'Incorrect password. Please try again.',
      statusCode: 401,
    },
    'auth/email-already-in-use': {
      code: 'EMAIL_EXISTS',
      message: 'Email already in use',
      userMessage: 'An account with this email already exists.',
      statusCode: 409,
    },
    'auth/weak-password': {
      code: 'WEAK_PASSWORD',
      message: 'Password is too weak',
      userMessage: 'Password must be at least 6 characters long.',
      statusCode: 400,
    },
    'auth/invalid-email': {
      code: 'INVALID_EMAIL',
      message: 'Invalid email format',
      userMessage: 'Please enter a valid email address.',
      statusCode: 400,
    },
    'permission-denied': {
      code: 'PERMISSION_DENIED',
      message: 'Permission denied',
      userMessage: 'You do not have permission to perform this action.',
      statusCode: 403,
    },
    'unavailable': {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Service unavailable',
      userMessage: 'The service is temporarily unavailable. Please try again later.',
      statusCode: 503,
    },
  };

  return errorMap[code] || {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'An unexpected error occurred',
    userMessage: 'Something went wrong. Please try again.',
    statusCode: 500,
  };
};

/**
 * Handles errors and returns user-friendly messages
 */
export const handleError = (error: unknown): ErrorDetails => {
  logger.error('Error occurred', error);

  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    // Check if it's a Firebase error (check both message and code property)
    const errorCode = (error as any).code || '';
    if (errorCode.startsWith('auth/') || error.message.includes('Firebase') || error.message.includes('auth/')) {
      return getFirebaseErrorMessage({ code: errorCode || error.message, message: error.message });
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      userMessage: 'An unexpected error occurred. Please try again.',
      statusCode: 500,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
    userMessage: 'Something went wrong. Please try again.',
    statusCode: 500,
  };
};

/**
 * Creates an AppError with user-friendly message
 */
export const createError = (
  code: string,
  message: string,
  userMessage: string,
  statusCode?: number
): AppError => {
  return new AppError(message, code, userMessage, statusCode);
};

