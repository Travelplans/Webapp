/**
 * Input validation schemas using Zod
 * Provides type-safe validation for forms and API requests
 */

import { z } from 'zod';

// User validation
export const UserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  roles: z.array(z.enum(['Admin', 'Agent', 'Customer', 'Relationship Manager'])).min(1, 'At least one role is required'),
});

export type UserInput = z.infer<typeof UserSchema>;

// Itinerary validation
export const ItinerarySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  destination: z.string().min(1, 'Destination is required'),
  duration: z.number().int().positive('Duration must be a positive number'),
  price: z.number().nonnegative('Price must be non-negative'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['Draft', 'Pending Approval', 'Approved', 'Rejected']),
});

export type ItineraryInput = z.infer<typeof ItinerarySchema>;

// Customer validation
export const CustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  bookingStatus: z.enum(['Pending', 'Confirmed', 'Completed', 'Cancelled']).optional(),
});

export type CustomerInput = z.infer<typeof CustomerSchema>;

// Booking validation
export const BookingSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  itineraryId: z.string().min(1, 'Itinerary ID is required'),
  status: z.enum(['Pending', 'Confirmed', 'Completed', 'Cancelled']),
  paymentStatus: z.enum(['Pending', 'Partial', 'Paid']).optional(),
});

export type BookingInput = z.infer<typeof BookingSchema>;

// Login validation
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// Generate Itinerary validation
export const GenerateItinerarySchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  duration: z.number().int().positive('Duration must be a positive number'),
  travelerType: z.string().min(1, 'Traveler type is required'),
  budget: z.string().min(1, 'Budget is required'),
});

export type GenerateItineraryInput = z.infer<typeof GenerateItinerarySchema>;

/**
 * Validates data against a schema and returns formatted errors
 */
export const validate = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((error) => {
    const path = error.path.join('.');
    errors[path] = error.message;
  });

  return { success: false, errors };
};

