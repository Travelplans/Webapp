/**
 * Tests for AI Service
 */

import { generateItinerary, generateImage, chatWithAI } from '../aiService';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Mock Firebase Functions
jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(),
  httpsCallable: jest.fn(),
}));

jest.mock('../../config/firebase', () => ({
  default: {},
}));

describe('aiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateItinerary', () => {
    it('should call Firebase function with correct parameters', async () => {
      const mockCallable = jest.fn().mockResolvedValue({
        data: { itinerary: 'Test itinerary' },
      });
      
      (httpsCallable as jest.Mock).mockReturnValue(mockCallable);
      (getFunctions as jest.Mock).mockReturnValue({});

      await generateItinerary({
        destination: 'Paris',
        duration: 7,
        travelerType: 'Family',
        budget: '$5000',
      });

      expect(mockCallable).toHaveBeenCalledWith({
        destination: 'Paris',
        duration: 7,
        travelerType: 'Family',
        budget: '$5000',
      });
    });

    it('should handle errors gracefully', async () => {
      const mockCallable = jest.fn().mockRejectedValue(new Error('API Error'));
      
      (httpsCallable as jest.Mock).mockReturnValue(mockCallable);
      (getFunctions as jest.Mock).mockReturnValue({});

      await expect(
        generateItinerary({
          destination: 'Paris',
          duration: 7,
          travelerType: 'Family',
          budget: '$5000',
        })
      ).rejects.toThrow('API Error');
    });
  });

  describe('generateImage', () => {
    it('should call Firebase function with prompt', async () => {
      const mockCallable = jest.fn().mockResolvedValue({
        data: { imageUrl: 'https://example.com/image.jpg' },
      });
      
      (httpsCallable as jest.Mock).mockReturnValue(mockCallable);
      (getFunctions as jest.Mock).mockReturnValue({});

      await generateImage('A beautiful sunset');

      expect(mockCallable).toHaveBeenCalledWith({ prompt: 'A beautiful sunset' });
    });
  });

  describe('chatWithAI', () => {
    it('should call Firebase function with message and history', async () => {
      const mockCallable = jest.fn().mockResolvedValue({
        data: { response: 'AI response' },
      });
      
      (httpsCallable as jest.Mock).mockReturnValue(mockCallable);
      (getFunctions as jest.Mock).mockReturnValue({});

      await chatWithAI('Hello', []);

      expect(mockCallable).toHaveBeenCalledWith({
        message: 'Hello',
        history: [],
      });
    });
  });
});

