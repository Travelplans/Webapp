/**
 * Integration tests for critical business flows
 * Tests complete user journeys end-to-end
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react';
import { AuthProvider } from '../../shared/context/AuthContext';
import { DataProvider } from '../../shared/context/DataContext';
import { ToastProvider } from '../../shared/context/ToastContext';
import LoginPage from '../../features/auth/pages/Login';
import Dashboard from '../../features/dashboard/pages/Dashboard';

// Mock Firebase
jest.mock('../../config/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
  analytics: Promise.resolve(null),
  default: {},
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
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

describe('Business Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Authentication Flow', () => {
    it('should complete login flow for Admin user', async () => {
      const user = userEvent.setup();
      const { signInWithEmailAndPassword, onAuthStateChanged } = require('firebase/auth');
      const { getDoc } = require('firebase/firestore');

      // Mock successful login
      signInWithEmailAndPassword.mockResolvedValueOnce({
        user: { uid: 'admin-123', email: 'admin@travelplans.fun' },
      });

      // Mock user document fetch
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          name: 'Admin User',
          email: 'admin@travelplans.fun',
          roles: ['Admin'],
        }),
        id: 'admin-123',
      });

      // Mock auth state change
      onAuthStateChanged.mockImplementation((auth: any, callback: any) => {
        setTimeout(() => {
          callback({
            uid: 'admin-123',
            email: 'admin@travelplans.fun',
          });
        }, 100);
        return jest.fn();
      });

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await act(async () => {
        await user.type(emailInput, 'admin@travelplans.fun');
        await user.type(passwordInput, 'Admin@123');
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'admin@travelplans.fun',
          'Admin@123'
        );
      });
    });

    it('should handle login failure gracefully', async () => {
      const user = userEvent.setup();
      const { signInWithEmailAndPassword } = require('firebase/auth');

      signInWithEmailAndPassword.mockRejectedValueOnce(
        new Error('auth/invalid-credential')
      );

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await act(async () => {
        await user.type(emailInput, 'wrong@email.com');
        await user.type(passwordInput, 'wrongpassword');
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/error|invalid|incorrect/i)).toBeInTheDocument();
      });
    });
  });

  describe('Role-Based Access Flow', () => {
    it('should show correct dashboard for Admin role', async () => {
      const { getDoc } = require('firebase/firestore');
      const { onAuthStateChanged } = require('firebase/auth');

      // Mock authenticated admin user
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          name: 'Admin User',
          email: 'admin@travelplans.fun',
          roles: ['Admin'],
        }),
        id: 'admin-123',
      });

      onAuthStateChanged.mockImplementation((auth: any, callback: any) => {
        callback({
          uid: 'admin-123',
          email: 'admin@travelplans.fun',
        });
        return jest.fn();
      });

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        // Admin should see user management options
        expect(screen.getByText(/dashboard|admin|management/i)).toBeInTheDocument();
      });
    });

    it('should show correct dashboard for Agent role', async () => {
      const { getDoc } = require('firebase/firestore');
      const { onAuthStateChanged } = require('firebase/auth');

      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          name: 'Agent User',
          email: 'agent@travelplans.fun',
          roles: ['Agent'],
        }),
        id: 'agent-123',
      });

      onAuthStateChanged.mockImplementation((auth: any, callback: any) => {
        callback({
          uid: 'agent-123',
          email: 'agent@travelplans.fun',
        });
        return jest.fn();
      });

      renderWithProviders(<Dashboard />);

      await waitFor(() => {
        // Agent should see customer management
        expect(screen.getByText(/dashboard|customer|agent/i)).toBeInTheDocument();
      });
    });
  });
});





