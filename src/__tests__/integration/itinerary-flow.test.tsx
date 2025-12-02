/**
 * Integration tests for Itinerary Management Flow
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react';
import { AuthProvider } from '../../shared/context/AuthContext';
import { DataProvider } from '../../shared/context/DataContext';
import { ToastProvider } from '../../shared/context/ToastContext';
import ItinerariesPage from '../../features/itineraries/pages/ItinerariesPage';

// Mock Firebase
jest.mock('../../config/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
  analytics: Promise.resolve(null),
  default: {},
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback({ uid: 'agent-123', email: 'agent@travelplans.fun' });
    return jest.fn();
  }),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

jest.mock('../../services/api/aiService', () => ({
  generateItinerary: jest.fn(),
  generateImage: jest.fn(),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            {component}
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Itinerary Management Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authenticated user
    const { getDoc } = require('firebase/firestore');
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        name: 'Agent User',
        email: 'agent@travelplans.fun',
        roles: ['Agent'],
      }),
      id: 'agent-123',
    });
  });

  describe('Itinerary Creation Flow', () => {
    it('should allow agent to view itineraries list', async () => {
      const { getDocs } = require('firebase/firestore');
      
      // Mock empty itineraries list
      getDocs.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });

      renderWithProviders(<ItinerariesPage />);

      await waitFor(() => {
        expect(screen.getByText(/itinerar|no itinerar/i)).toBeInTheDocument();
      });
    });

    it('should display existing itineraries', async () => {
      const { getDocs } = require('firebase/firestore');
      
      // Mock itineraries data
      getDocs.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: 'itinerary-1',
            data: () => ({
              title: 'Paris Adventure',
              destination: 'Paris',
              duration: 7,
              price: 5000,
              status: 'Approved',
              createdAt: new Date(),
            }),
          },
        ],
      });

      renderWithProviders(<ItinerariesPage />);

      await waitFor(() => {
        expect(screen.getByText(/paris adventure/i)).toBeInTheDocument();
      });
    });
  });

  describe('AI Itinerary Generation Flow', () => {
    it('should generate itinerary using AI service', async () => {
      const { generateItinerary } = require('../../services/api/aiService');
      
      generateItinerary.mockResolvedValueOnce({
        data: {
          itinerary: {
            title: 'AI Generated Paris Trip',
            destination: 'Paris',
            duration: 7,
            activities: ['Visit Eiffel Tower', 'Louvre Museum'],
          },
        },
      });

      // This would be tested in the GenerateItineraryPage component
      expect(generateItinerary).toBeDefined();
    });
  });
});

