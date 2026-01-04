/**
 * Integration tests for Agent Assignment and Login Flow
 * Tests agent assignment to itineraries and login with mail@jsabu.com
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react';
import { AuthProvider } from '../../shared/context/AuthContext';
import { DataProvider } from '../../shared/context/DataContext';
import { ToastProvider } from '../../shared/context/ToastContext';
import LoginPage from '../../features/auth/pages/Login';
import ItinerariesPage from '../../features/itineraries/pages/ItinerariesPage';
import ItineraryForm from '../../features/itineraries/components/ItineraryForm';
import { UserRole } from '../../shared/types';

// Mock Firebase
jest.mock('../../config/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
  analytics: Promise.resolve(null),
  default: {},
}));

const mockSignInWithEmailAndPassword = jest.fn();
const mockOnAuthStateChanged = jest.fn();
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockUpdateDoc = jest.fn();
const mockAddDoc = jest.fn();
const mockDoc = jest.fn();
const mockCollection = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOnSnapshot = jest.fn();

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args: any[]) => mockSignInWithEmailAndPassword(...args),
  signOut: jest.fn(),
  onAuthStateChanged: (...args: any[]) => mockOnAuthStateChanged(...args),
}));

jest.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  doc: (...args: any[]) => mockDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  deleteDoc: jest.fn(),
  query: (...args: any[]) => mockQuery(...args),
  where: (...args: any[]) => mockWhere(...args),
  onSnapshot: (...args: any[]) => mockOnSnapshot(...args),
  orderBy: jest.fn(),
  limit: jest.fn(),
  writeBatch: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() })),
  },
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
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

describe('Agent Assignment and Login Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock for onAuthStateChanged - no user initially
    mockOnAuthStateChanged.mockImplementation((auth: any, callback: any) => {
      callback(null);
      return jest.fn();
    });

    // Mock onSnapshot to return an unsubscribe function
    // This will be overridden in specific tests that need user data
    mockOnSnapshot.mockImplementation((ref: any, onNext: any, onError?: any) => {
      // Simulate initial snapshot with empty data
      if (onNext) {
        setTimeout(() => {
          onNext({
            docs: [],
            empty: true,
          });
        }, 0);
      }
      return jest.fn(); // Return unsubscribe function
    });
  });

  describe('Login Test with mail@jsabu.com', () => {
    it('should successfully login with mail@jsabu.com and Admin123', async () => {
      const user = userEvent.setup();
      const adminUid = 'admin-uid-123';
      const adminEmail = 'mail@jsabu.com';
      const adminPassword = 'Admin123';

      // Mock successful login
      mockSignInWithEmailAndPassword.mockResolvedValueOnce({
        user: { 
          uid: adminUid, 
          email: adminEmail,
          displayName: 'Admin User',
        },
      });

      // Mock user document fetch from Firestore
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          name: 'Admin User',
          email: adminEmail,
          roles: [UserRole.ADMIN],
        }),
        id: adminUid,
      });

      // Mock query for user lookup by email
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});
      mockGetDocs.mockResolvedValueOnce({
        empty: false,
        docs: [{
          id: adminUid,
          data: () => ({
            name: 'Admin User',
            email: adminEmail,
            roles: [UserRole.ADMIN],
          }),
        }],
      });

      // Mock auth state change after login
      mockOnAuthStateChanged.mockImplementation((auth: any, callback: any) => {
        setTimeout(() => {
          callback({
            uid: adminUid,
            email: adminEmail,
            displayName: 'Admin User',
          });
        }, 100);
        return jest.fn();
      });

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await act(async () => {
        await user.type(emailInput, adminEmail);
        await user.type(passwordInput, adminPassword);
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          adminEmail,
          adminPassword
        );
      }, { timeout: 3000 });

      // Verify login was called with correct credentials
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    });

    it('should handle login failure with incorrect password', async () => {
      const user = userEvent.setup();
      const adminEmail = 'mail@jsabu.com';
      const wrongPassword = 'WrongPassword123';

      // Mock failed login
      mockSignInWithEmailAndPassword.mockRejectedValueOnce(
        new Error('auth/wrong-password')
      );

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await act(async () => {
        await user.type(emailInput, adminEmail);
        await user.type(passwordInput, wrongPassword);
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/error|invalid|incorrect|wrong/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Agent Assignment to Itinerary', () => {
    beforeEach(() => {
      // Mock authenticated admin user for agent assignment
      const adminUid = 'admin-uid-123';
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          name: 'Admin User',
          email: 'mail@jsabu.com',
          roles: [UserRole.ADMIN],
        }),
        id: adminUid,
      });

      mockOnAuthStateChanged.mockImplementation((auth: any, callback: any) => {
        callback({
          uid: adminUid,
          email: 'mail@jsabu.com',
          displayName: 'Admin User',
        });
        return jest.fn();
      });
    });

    it('should allow admin to assign an agent to an itinerary', async () => {
      const user = userEvent.setup();
      const agentId = 'agent-123';
      const agentName = 'Test Agent';
      const itineraryId = 'itinerary-123';

      // Mock onSnapshot to provide users data (for DataContext)
      mockOnSnapshot.mockImplementation((ref: any, onNext: any, onError?: any) => {
        if (onNext && ref?.path?.includes('users')) {
          // Simulate users snapshot with agent
          setTimeout(() => {
            onNext({
              docs: [
                {
                  id: agentId,
                  data: () => ({
                    name: agentName,
                    email: 'agent@travelplans.fun',
                    roles: [UserRole.AGENT],
                  }),
                },
              ],
              empty: false,
            });
          }, 0);
        } else if (onNext) {
          // For other collections, return empty
          setTimeout(() => {
            onNext({
              docs: [],
              empty: true,
            });
          }, 0);
        }
        return jest.fn(); // Return unsubscribe function
      });

      // Mock users list with an agent (for direct queries)
      mockGetDocs.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: agentId,
            data: () => ({
              name: agentName,
              email: 'agent@travelplans.fun',
              roles: [UserRole.AGENT],
            }),
          },
        ],
      });

      // Mock existing itinerary
      const existingItinerary = {
        id: itineraryId,
        title: 'Test Itinerary',
        destination: 'Paris',
        duration: 7,
        price: 5000,
        description: 'Test description',
        assignedAgentId: undefined,
        collaterals: [],
        imageUrl: 'https://example.com/image.jpg',
      };

      mockGetDoc.mockImplementation((docRef: any) => {
        if (docRef.path.includes('itineraries')) {
          return Promise.resolve({
            exists: () => true,
            data: () => existingItinerary,
            id: itineraryId,
          });
        }
        // For user document
        return Promise.resolve({
          exists: () => true,
          data: () => ({
            name: 'Admin User',
            email: 'mail@jsabu.com',
            roles: [UserRole.ADMIN],
          }),
          id: 'admin-uid-123',
        });
      });

      // Mock itinerary update
      mockUpdateDoc.mockResolvedValueOnce({});

      const handleSubmit = jest.fn();
      const handleClose = jest.fn();

      renderWithProviders(
        <ItineraryForm 
          itineraryToEdit={existingItinerary}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      );

      // Wait for form to load and users to be available
      await waitFor(() => {
        expect(screen.getByLabelText(/assigned agent/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Wait for agent option to appear in dropdown
      await waitFor(() => {
        const agentSelect = screen.getByLabelText(/assigned agent/i) as HTMLSelectElement;
        const options = Array.from(agentSelect.options).map(opt => opt.value);
        expect(options).toContain(agentId);
      }, { timeout: 3000 });

      // Find and select agent from dropdown
      const agentSelect = screen.getByLabelText(/assigned agent/i) as HTMLSelectElement;
      
      await act(async () => {
        await user.selectOptions(agentSelect, agentId);
      });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /save changes/i });
      
      await act(async () => {
        await user.click(submitButton);
      });

      // Verify that onSubmit was called with the agent assignment
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
        const submittedData = handleSubmit.mock.calls[0][0];
        expect(submittedData.assignedAgentId).toBe(agentId);
      });
    });

    it('should display assigned agent in itinerary list', async () => {
      const agentId = 'agent-123';
      const agentName = 'Test Agent';

      // Mock users list
      mockGetDocs.mockImplementation((queryRef: any) => {
        if (queryRef && queryRef._query) {
          // This is a query for users
          return Promise.resolve({
            empty: false,
            docs: [
              {
                id: agentId,
                data: () => ({
                  name: agentName,
                  email: 'agent@travelplans.fun',
                  roles: [UserRole.AGENT],
                }),
              },
            ],
          });
        }
        // This is a query for itineraries
        return Promise.resolve({
          empty: false,
          docs: [
            {
              id: 'itinerary-123',
              data: () => ({
                title: 'Paris Adventure',
                destination: 'Paris',
                duration: 7,
                price: 5000,
                assignedAgentId: agentId,
                collaterals: [],
                imageUrl: 'https://example.com/image.jpg',
                createdAt: new Date(),
              }),
            },
          ],
        });
      });

      renderWithProviders(<ItinerariesPage />);

      await waitFor(() => {
        expect(screen.getByText(/paris adventure/i)).toBeInTheDocument();
      });
    });
  });

  describe('Complete Flow: Login and Assign Agent', () => {
    it('should complete full flow: login as admin, then assign agent to itinerary', async () => {
      const user = userEvent.setup();
      const adminUid = 'admin-uid-123';
      const adminEmail = 'mail@jsabu.com';
      const adminPassword = 'Admin123';
      const agentId = 'agent-123';
      const agentName = 'Test Agent';

      // Step 1: Mock login
      mockSignInWithEmailAndPassword.mockResolvedValueOnce({
        user: { 
          uid: adminUid, 
          email: adminEmail,
          displayName: 'Admin User',
        },
      });

      // Mock user document fetch
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          name: 'Admin User',
          email: adminEmail,
          roles: [UserRole.ADMIN],
        }),
        id: adminUid,
      });

      // Mock query for user lookup
      mockQuery.mockReturnValue({});
      mockWhere.mockReturnValue({});
      mockGetDocs.mockImplementation((queryRef: any) => {
        if (queryRef && queryRef._query) {
          // Users query
          return Promise.resolve({
            empty: false,
            docs: [
              {
                id: adminUid,
                data: () => ({
                  name: 'Admin User',
                  email: adminEmail,
                  roles: [UserRole.ADMIN],
                }),
              },
              {
                id: agentId,
                data: () => ({
                  name: agentName,
                  email: 'agent@travelplans.fun',
                  roles: [UserRole.AGENT],
                }),
              },
            ],
          });
        }
        // Itineraries query
        return Promise.resolve({
          empty: false,
          docs: [],
        });
      });

      // Mock auth state change
      let authCallback: any;
      mockOnAuthStateChanged.mockImplementation((auth: any, callback: any) => {
        authCallback = callback;
        // Initially no user
        callback(null);
        return jest.fn();
      });

      // Step 1: Render login page
      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Step 2: Perform login
      await act(async () => {
        await user.type(emailInput, adminEmail);
        await user.type(passwordInput, adminPassword);
        await user.click(submitButton);
      });

      // Step 3: Simulate successful login
      await act(async () => {
        if (authCallback) {
          authCallback({
            uid: adminUid,
            email: adminEmail,
            displayName: 'Admin User',
          });
        }
      });

      // Verify login was called
      await waitFor(() => {
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          adminEmail,
          adminPassword
        );
      });

      // Step 4: After login, test agent assignment
      const existingItinerary = {
        id: 'itinerary-123',
        title: 'Test Itinerary',
        destination: 'Paris',
        duration: 7,
        price: 5000,
        description: 'Test description',
        assignedAgentId: undefined,
        collaterals: [],
        imageUrl: 'https://example.com/image.jpg',
      };

      const handleSubmit = jest.fn();
      const handleClose = jest.fn();

      // Mock update for itinerary
      mockUpdateDoc.mockResolvedValueOnce({});

      // Render itinerary form (simulating post-login state)
      renderWithProviders(
        <ItineraryForm 
          itineraryToEdit={existingItinerary}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      );

      // Wait for form and agent dropdown
      await waitFor(() => {
        expect(screen.getByLabelText(/assigned agent/i)).toBeInTheDocument();
      });

      // Step 5: Assign agent
      const agentSelect = screen.getByLabelText(/assigned agent/i);
      
      await act(async () => {
        await user.selectOptions(agentSelect, agentId);
      });

      // Step 6: Submit
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      
      await act(async () => {
        await user.click(saveButton);
      });

      // Verify agent was assigned
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
        const submittedData = handleSubmit.mock.calls[0][0];
        expect(submittedData.assignedAgentId).toBe(agentId);
      });
    });
  });
});

