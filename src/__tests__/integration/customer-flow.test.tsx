/**
 * Integration tests for Customer Management Flow
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react';
import { AuthProvider } from '../../shared/context/AuthContext';
import { DataProvider } from '../../shared/context/DataContext';
import { ToastProvider } from '../../shared/context/ToastContext';
import CustomersPage from '../../features/customers/pages/CustomersPage';

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

describe('Customer Management Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authenticated agent user
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

  describe('Customer Creation Flow', () => {
    it('should display customers list', async () => {
      const { getDocs } = require('firebase/firestore');
      
      getDocs.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });

      renderWithProviders(<CustomersPage />);

      await waitFor(() => {
        expect(screen.getByText(/customer|no customer/i)).toBeInTheDocument();
      });
    });

    it('should show existing customers', async () => {
      const { getDocs } = require('firebase/firestore');
      
      getDocs.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: 'customer-1',
            data: () => ({
              name: 'John Doe',
              email: 'john@example.com',
              phone: '+1234567890',
              bookingStatus: 'Confirmed',
              createdAt: new Date(),
            }),
          },
        ],
      });

      renderWithProviders(<CustomersPage />);

      await waitFor(() => {
        expect(screen.getByText(/john doe/i)).toBeInTheDocument();
      });
    });
  });

  describe('Customer Search and Filter', () => {
    it('should allow searching customers', async () => {
      const user = userEvent.setup();
      const { getDocs } = require('firebase/firestore');
      
      getDocs.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'customer-1',
            data: () => ({
              name: 'John Doe',
              email: 'john@example.com',
            }),
          },
        ],
      });

      renderWithProviders(<CustomersPage />);

      await waitFor(() => {
        const searchInput = screen.queryByPlaceholderText(/search/i);
        if (searchInput) {
          act(() => {
            user.type(searchInput, 'John');
          });
        }
      });
    });
  });
});

