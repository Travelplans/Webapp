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
    'auth/invalid-login-credentials': {
      code: 'INVALID_LOGIN_CREDENTIALS',
      message: 'Invalid login credentials',
      userMessage: 'Incorrect email or password. Please try again.',
      statusCode: 401,
    },
    'auth/invalid-credential': {
      code: 'INVALID_CREDENTIAL',
      message: 'Invalid credential',
      userMessage: 'Incorrect email or password. Please try again.',
      statusCode: 401,
    },
    'auth/too-many-requests': {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests',
      userMessage: 'Too many attempts. Please try again later.',
      statusCode: 429,
    },
    'auth/operation-not-allowed': {
      code: 'OPERATION_NOT_ALLOWED',
      message: 'Operation not allowed',
      userMessage: 'This sign-in method is disabled. Enable it in Firebase Console → Authentication.',
      statusCode: 400,
    },
    'auth/unauthorized-domain': {
      code: 'UNAUTHORIZED_DOMAIN',
      message: 'Unauthorized domain',
      userMessage: 'This domain is not authorized for Firebase Auth. Add it in Firebase Console → Authentication → Settings → Authorized domains.',
      statusCode: 400,
    },
    'auth/network-request-failed': {
      code: 'NETWORK_REQUEST_FAILED',
      message: 'Network request failed',
      userMessage: 'Network error. Please check your connection and try again.',
      statusCode: 0,
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
 * Uses error cache to prevent duplicate error messages
 */
import { cacheAndCheckError, shouldShowError } from './errorCache';

export const handleError = (error: unknown, suppressDuplicates: boolean = true): ErrorDetails => {
  logger.error('Error occurred', error);

  let errorDetails: ErrorDetails;

  if (error instanceof AppError) {
    errorDetails = {
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      statusCode: error.statusCode,
    };
  } else if (error instanceof Error) {
    // Check if it's a Firebase error (check both message and code property)
    const errorCode = (error as any).code || '';
    if (errorCode.startsWith('auth/') || error.message.includes('Firebase') || error.message.includes('auth/')) {
      errorDetails = getFirebaseErrorMessage({ code: errorCode || error.message, message: error.message });
    } else {
      errorDetails = {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        userMessage: 'An unexpected error occurred. Please try again.',
        statusCode: 500,
      };
    }
  } else {
    errorDetails = {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      userMessage: 'Something went wrong. Please try again.',
      statusCode: 500,
    };
  }

  // Cache error and check if it should be shown
  if (suppressDuplicates) {
    const { shouldShow, count } = cacheAndCheckError(error, errorDetails.userMessage);
    if (!shouldShow && count > 1) {
      // Suppress duplicate error, but log it
      logger.warn(`Error suppressed (occurred ${count} times)`, error);
      // Return a special flag to indicate suppression
      return {
        ...errorDetails,
        userMessage: '', // Empty message means suppress
      };
    }
  }

  return errorDetails;
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

