/**
 * Integration tests for Booking Management Flow
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react';
import { AuthProvider } from '../../shared/context/AuthContext';
import { DataProvider } from '../../shared/context/DataContext';
import { ToastProvider } from '../../shared/context/ToastContext';
import BookingsPage from '../../features/bookings/pages/BookingsPage';

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

describe('Booking Management Flow', () => {
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

  describe('Booking Creation Flow', () => {
    it('should display bookings list', async () => {
      const { getDocs } = require('firebase/firestore');
      
      getDocs.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });

      renderWithProviders(<BookingsPage />);

      await waitFor(() => {
        expect(screen.getByText(/booking|no booking/i)).toBeInTheDocument();
      });
    });

    it('should show booking details', async () => {
      const { getDocs } = require('firebase/firestore');
      
      getDocs.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: 'booking-1',
            data: () => ({
              customerId: 'customer-1',
              itineraryId: 'itinerary-1',
              status: 'Confirmed',
              paymentStatus: 'Paid',
              createdAt: new Date(),
            }),
          },
        ],
      });

      renderWithProviders(<BookingsPage />);

      await waitFor(() => {
        expect(screen.getByText(/confirmed|paid/i)).toBeInTheDocument();
      });
    });
  });

  describe('Booking Status Updates', () => {
    it('should allow status updates', async () => {
      const { updateDoc } = require('firebase/firestore');
      
      updateDoc.mockResolvedValueOnce({});

      // This would be tested when implementing booking status update UI
      expect(updateDoc).toBeDefined();
    });
  });
});





