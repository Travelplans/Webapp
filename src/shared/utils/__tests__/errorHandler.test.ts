/**
 * Tests for error handling utilities
 */

import { AppError, handleError, createError } from '../errorHandler';

describe('errorHandler', () => {
  describe('AppError', () => {
    it('should create an AppError with all properties', () => {
      const error = new AppError('Test error', 'TEST_CODE', 'User message', 400);
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.userMessage).toBe('User message');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('AppError');
    });
  });

  describe('handleError', () => {
    it('should handle AppError instances', () => {
      const error = new AppError('Test', 'TEST', 'User message', 400);
      const result = handleError(error);
      
      expect(result.code).toBe('TEST');
      expect(result.userMessage).toBe('User message');
      expect(result.statusCode).toBe(400);
    });

    it('should handle Firebase auth errors', () => {
      const error: any = new Error('Firebase: Error (auth/user-not-found).');
      error.code = 'auth/user-not-found'; // Firebase errors have a code property
      const result = handleError(error);
      
      expect(result.code).toBe('USER_NOT_FOUND');
      expect(result.userMessage).toContain('No account found');
    });

    it('should handle unknown errors', () => {
      const error = new Error('Unknown error');
      const result = handleError(error);
      
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.userMessage).toBeTruthy();
    });
  });

  describe('createError', () => {
    it('should create an AppError', () => {
      const error = createError('TEST', 'Message', 'User message', 400);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe('TEST');
    });
  });
});

