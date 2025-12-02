/**
 * Integration tests for AI Itinerary Generation Flow
 */

import { generateItinerary, generateImage, chatWithAI } from '../../../services/api/aiService';

// Mock Firebase Auth
jest.mock('../../../config/firebase', () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn().mockResolvedValue('mock-token'),
    },
  },
  default: {},
}));

// Mock fetch
global.fetch = jest.fn();

describe('AI Generation Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Itinerary Generation', () => {
    it('should generate itinerary with valid parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          title: 'Paris Adventure',
          price: 5000,
          description: 'A wonderful trip to Paris',
          dailyPlan: [
            { day: 1, title: 'Arrival', activities: 'Check in to hotel' },
            { day: 2, title: 'Sightseeing', activities: 'Visit Eiffel Tower' },
          ],
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await generateItinerary({
        destination: 'Paris',
        duration: '7',
        travelerType: 'Family',
        budget: '$5000',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/generateItinerary'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
          }),
        })
      );

      expect(result.title).toBe('Paris Adventure');
      expect(result.price).toBe(5000);
    });

    it('should handle generation errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'AI service unavailable' }),
      });

      await expect(
        generateItinerary({
          destination: 'Paris',
          duration: '7',
          travelerType: 'Family',
          budget: '$5000',
        })
      ).rejects.toThrow();
    });
  });

  describe('Image Generation', () => {
    it('should generate image from prompt', async () => {
      const mockResponse = {
        success: true,
        data: {
          imageUrl: 'https://example.com/generated-image.jpg',
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await generateImage({ prompt: 'Beautiful sunset over Paris' });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/generateImage'),
        expect.objectContaining({
          method: 'POST',
        })
      );

      expect(result.imageUrl).toBe('https://example.com/generated-image.jpg');
    });
  });

  describe('AI Chat Flow', () => {
    it('should handle chat conversation', async () => {
      const mockResponse = {
        success: true,
        data: {
          text: 'I can help you plan your trip to Paris!',
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await chatWithAI({
        message: 'Tell me about Paris',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/chat'),
        expect.objectContaining({
          method: 'POST',
        })
      );

      expect(result.text).toBe('I can help you plan your trip to Paris!');
    });

    it('should include itinerary context when provided', async () => {
      const mockResponse = {
        success: true,
        data: {
          text: 'Based on your itinerary, here are some recommendations...',
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await chatWithAI({
        message: 'What should I see?',
        itineraryContext: 'Paris 7-day trip',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/chat'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('itineraryContext'),
        })
      );
    });
  });
});

