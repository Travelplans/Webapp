/**
 * Tests for validation utilities
 */

import { UserSchema, LoginSchema, ItinerarySchema, validate } from '../validation';

describe('validation', () => {
  describe('UserSchema', () => {
    it('should validate correct user data', () => {
      const validUser = {
        name: 'John Doe',
        email: 'john@example.com',
        roles: ['Admin'],
      };
      
      const result = validate(UserSchema, validUser);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validUser);
      }
    });

    it('should reject invalid email', () => {
      const invalidUser = {
        name: 'John Doe',
        email: 'not-an-email',
        roles: ['Admin'],
      };
      
      const result = validate(UserSchema, invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors['email']).toBeDefined();
      }
    });

    it('should reject empty name', () => {
      const invalidUser = {
        name: '',
        email: 'john@example.com',
        roles: ['Admin'],
      };
      
      const result = validate(UserSchema, invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors['name']).toBeDefined();
      }
    });

    it('should reject empty roles array', () => {
      const invalidUser = {
        name: 'John Doe',
        email: 'john@example.com',
        roles: [],
      };
      
      const result = validate(UserSchema, invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors['roles']).toBeDefined();
      }
    });
  });

  describe('LoginSchema', () => {
    it('should validate correct login data', () => {
      const validLogin = {
        email: 'user@example.com',
        password: 'password123',
      };
      
      const result = validate(LoginSchema, validLogin);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidLogin = {
        email: 'not-an-email',
        password: 'password123',
      };
      
      const result = validate(LoginSchema, invalidLogin);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidLogin = {
        email: 'user@example.com',
        password: '12345', // Less than 6 characters
      };
      
      const result = validate(LoginSchema, invalidLogin);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors['password']).toBeDefined();
      }
    });
  });

  describe('ItinerarySchema', () => {
    it('should validate correct itinerary data', () => {
      const validItinerary = {
        title: 'Paris Adventure',
        destination: 'Paris',
        duration: 7,
        price: 5000,
        description: 'A wonderful trip to Paris',
        status: 'Draft',
      };
      
      const result = validate(ItinerarySchema, validItinerary);
      expect(result.success).toBe(true);
    });

    it('should reject negative price', () => {
      const invalidItinerary = {
        title: 'Paris Adventure',
        destination: 'Paris',
        duration: 7,
        price: -100,
        description: 'A wonderful trip to Paris',
        status: 'Draft',
      };
      
      const result = validate(ItinerarySchema, invalidItinerary);
      expect(result.success).toBe(false);
    });
  });
});

