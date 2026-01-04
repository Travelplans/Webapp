import React, { createContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, Itinerary, Customer, Booking, ItineraryCollateral, CustomerDocument, RecommendedItinerary } from '../types';
import * as firestoreService from '../../services/firestore/firestoreService';
import { useAuth } from '../hooks/useAuth';

// AI Simulation Helpers
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface DataContextType {
  users: User[];
  itineraries: Itinerary[];
  customers: Customer[];
  bookings: Booking[];
  loading: boolean;
  addUser: (user: Omit<User, 'id'> & { password?: string }) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addItinerary: (itinerary: Omit<Itinerary, 'id'>) => Promise<void>;
  updateItinerary: (itinerary: Itinerary) => Promise<void>;
  deleteItinerary: (itineraryId: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'bookingStatus' | 'documents' | 'registrationDate'>) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  addDocumentToCustomer: (customerId: string, document: Omit<CustomerDocument, 'id' | 'url'>, file?: File) => Promise<void>;
  updateCollateral: (itineraryId: string, collateralId: string, updates: Partial<ItineraryCollateral>) => Promise<void>;
  deleteCollateral: (itineraryId: string, collateralId: string) => Promise<void>;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => Promise<void>;
  addBooking: (booking: Omit<Booking, 'id' | 'bookingDate' | 'status' | 'paymentStatus'>) => Promise<void>;
  // AI Features
  generateCustomerSummary: (customer: Customer) => Promise<string>;
  verifyDocumentWithAi: (customerId: string, documentId: string) => Promise<void>;
  getCollateralAiFeedback: (itineraryId: string, collateralId: string) => Promise<void>;
  getRecommendedItineraries: (customerId: string) => Promise<RecommendedItinerary[]>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const subscriptionsRef = useRef<Array<() => void>>([]);

  // Subscribe to real-time Firestore updates
  // Re-subscribe when authentication state changes
  useEffect(() => {
    // Don't set up subscriptions until auth is ready
    if (authLoading) {
      return;
    }

    // If not authenticated, clear data and don't subscribe
    if (!isAuthenticated) {
      setUsers([]);
      setItineraries([]);
      setCustomers([]);
      setBookings([]);
      setLoading(false);
      return;
    }

    console.log('[DataContext] Setting up subscriptions (authenticated:', isAuthenticated, ')');
    setLoading(true);

    // Clean up any existing subscriptions
    subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
    subscriptionsRef.current = [];

    let hasFired = {
      users: false,
      itineraries: false,
      customers: false,
      bookings: false,
    };

    const checkLoadingComplete = () => {
      // If all subscriptions have fired at least once, set loading to false
      if (hasFired.users && hasFired.itineraries && hasFired.customers && hasFired.bookings) {
        console.log('[DataContext] All subscriptions have fired, setting loading to false');
        setLoading(false);
      }
    };

    const unsubscribeUsers = firestoreService.subscribeToUsers((updatedUsers) => {
      console.log('[DataContext] Users subscription callback received:', {
        count: updatedUsers.length,
        ids: updatedUsers.map(u => u.id)
      });
      setUsers(updatedUsers);
      if (!hasFired.users) {
        hasFired.users = true;
        checkLoadingComplete();
      }
    });
    subscriptionsRef.current.push(unsubscribeUsers);

    const unsubscribeItineraries = (user?.roles?.includes('Agent') && !user?.roles?.includes('Admin') && user?.id)
      ? firestoreService.subscribeToItinerariesForAgent(user.id, (updatedItineraries) => {
        console.log('[DataContext] Itineraries (agent) subscription callback received:', {
          count: updatedItineraries.length,
          ids: updatedItineraries.map(it => it.id),
          titles: updatedItineraries.map(it => it.title),
        });
        setItineraries([...updatedItineraries]);
        if (!hasFired.itineraries) {
          hasFired.itineraries = true;
          checkLoadingComplete();
        }
      })
      : firestoreService.subscribeToItineraries((updatedItineraries) => {
      console.log('[DataContext] Itineraries subscription callback received:', {
        count: updatedItineraries.length,
        ids: updatedItineraries.map(it => it.id),
        titles: updatedItineraries.map(it => it.title),
        assignedAgentIds: updatedItineraries.map(it => ({
          id: it.id,
          title: it.title,
          assignedAgentIds: it.assignedAgentIds,
          assignedAgentId: it.assignedAgentId
        }))
      });
      // Force state update to ensure React re-renders
      setItineraries([...updatedItineraries]);
      if (!hasFired.itineraries) {
        hasFired.itineraries = true;
        checkLoadingComplete();
      }
    });
    subscriptionsRef.current.push(unsubscribeItineraries);

    const unsubscribeCustomers = firestoreService.subscribeToCustomers((updatedCustomers) => {
      console.log('[DataContext] Customers subscription callback received:', {
        count: updatedCustomers.length,
        ids: updatedCustomers.map(c => c.id),
        emails: updatedCustomers.map(c => c.email)
      });
      setCustomers(updatedCustomers);
      if (!hasFired.customers) {
        hasFired.customers = true;
        checkLoadingComplete();
      }
    });
    subscriptionsRef.current.push(unsubscribeCustomers);

    const unsubscribeBookings = firestoreService.subscribeToBookings((updatedBookings) => {
      console.log('[DataContext] Bookings subscription callback received:', {
        count: updatedBookings.length,
        ids: updatedBookings.map(b => b.id),
        customerIds: updatedBookings.map(b => b.customerId)
      });
      setBookings(updatedBookings);
      if (!hasFired.bookings) {
        hasFired.bookings = true;
        checkLoadingComplete();
      }
    });
    subscriptionsRef.current.push(unsubscribeBookings);

    // Fallback: Set loading to false after max 2 seconds to prevent blocking
    // This ensures pages render even if subscriptions are slow
    const fallbackTimer = setTimeout(() => {
      console.log('[DataContext] Fallback timer fired - setting loading to false');
      setLoading(false);
    }, 2000);

    // Cleanup subscriptions on unmount or when auth state changes
    return () => {
      console.log('[DataContext] Cleaning up subscriptions');
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
      subscriptionsRef.current = [];
      clearTimeout(fallbackTimer);
    };
  }, [isAuthenticated, authLoading, user?.id, user?.roles]);

  // Manual refresh function to force data reload
  // Note: Subscriptions should handle updates automatically, but this can be used as a fallback
  const refreshData = async () => {
    if (!isAuthenticated) {
      console.log('[DataContext] Cannot refresh - not authenticated');
      return;
    }

    console.log('[DataContext] Manual refresh triggered - subscriptions should handle this automatically');
    // The subscriptions will automatically update the data when Firestore changes
    // This function is mainly for debugging or forcing a re-check
    // We can trigger a re-subscription by temporarily clearing and re-setting
    setLoading(true);
    
    // Small delay to allow subscriptions to catch up
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // --- CRUD Functions ---
  const addUser = async (user: Omit<User, 'id'> & { password?: string }) => {
    try {
      await firestoreService.addUser(user);
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      const { id, ...updates } = updatedUser;
      await firestoreService.updateUser(id, updates);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Prevent deletion of the primary admin account
      const user = users.find(u => u.id === userId);
      if (user && user.email === 'mail@jsabu.com') {
        throw new Error('Cannot delete the primary admin account (mail@jsabu.com).');
      }
      
      await firestoreService.deleteUser(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const addItinerary = async (itinerary: Omit<Itinerary, 'id'>) => {
    try {
      console.log('[DataContext] Adding itinerary:', { 
        title: itinerary.title, 
        destination: itinerary.destination,
        hasAssignedAgentId: !!itinerary.assignedAgentId 
      });
      
      // Build itinerary data explicitly, excluding id and undefined values
      const itineraryData: any = {
        title: itinerary.title,
        destination: itinerary.destination,
        duration: itinerary.duration,
        price: itinerary.price,
        description: itinerary.description || '',
        imageUrl: itinerary.imageUrl || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070',
        collaterals: itinerary.collaterals || [],
      };
      
      // Include dailyPlan if it exists (for AI-generated itineraries)
      if (itinerary.dailyPlan && Array.isArray(itinerary.dailyPlan) && itinerary.dailyPlan.length > 0) {
        itineraryData.dailyPlan = itinerary.dailyPlan;
      }
      
      // Support both old (assignedAgentId) and new (assignedAgentIds) format
      if (itinerary.assignedAgentIds && Array.isArray(itinerary.assignedAgentIds) && itinerary.assignedAgentIds.length > 0) {
        itineraryData.assignedAgentIds = itinerary.assignedAgentIds;
      } else if (itinerary.assignedAgentId) {
        // Migrate from old format to new format
        itineraryData.assignedAgentIds = [itinerary.assignedAgentId];
        itineraryData.assignedAgentId = itinerary.assignedAgentId; // Keep for backward compatibility
      }
      
      // Final safety check - remove any undefined or null values (shouldn't be any, but just in case)
      Object.keys(itineraryData).forEach(key => {
        if (itineraryData[key] === undefined || itineraryData[key] === null) {
          delete itineraryData[key];
        }
      });
      
      // Explicitly ensure id is not included
      delete itineraryData.id;
      
      console.log('[DataContext] Cleaned itinerary data:', itineraryData);
      await firestoreService.addItinerary(itineraryData);
      console.log('[DataContext] Itinerary added successfully');
    } catch (error) {
      console.error('[DataContext] Error adding itinerary:', error);
      throw error;
    }
  };

  const updateItinerary = async (updatedItinerary: Itinerary) => {
    try {
      const { id, ...updates } = updatedItinerary;
      await firestoreService.updateItinerary(id, updates);
    } catch (error) {
      console.error('Error updating itinerary:', error);
      throw error;
    }
  };

  const deleteItinerary = async (itineraryId: string) => {
    try {
      await firestoreService.deleteItinerary(itineraryId);
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      throw error;
    }
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'bookingStatus' | 'documents' | 'registrationDate'>) => {
    try {
      console.log('[DataContext] Adding customer:', { 
        firstName: customer.firstName, 
        lastName: customer.lastName,
        email: customer.email,
        hasAssignedRmId: !!customer.assignedRmId 
      });
      
      // Remove undefined values - Firestore doesn't allow undefined
      const customerData: any = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        dob: customer.dob,
        registeredByAgentId: customer.registeredByAgentId,
      };
      
      // Only include assignedRmId if it has a truthy value
      if (customer.assignedRmId) {
        customerData.assignedRmId = customer.assignedRmId;
      }
      
      // Remove any undefined values (safety check)
      Object.keys(customerData).forEach(key => {
        if (customerData[key] === undefined || customerData[key] === null) {
          delete customerData[key];
        }
      });
      
      console.log('[DataContext] Cleaned customer data:', customerData);
      await firestoreService.addCustomer(customerData);
      console.log('[DataContext] Customer added successfully');
    } catch (error) {
      console.error('[DataContext] Error adding customer:', error);
      throw error;
    }
  };

  const updateCustomer = async (updatedCustomer: Customer) => {
    try {
      const { id, ...updates } = updatedCustomer;
      await firestoreService.updateCustomer(id, updates);
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };

  const addDocumentToCustomer = async (
    customerId: string,
    documentData: Omit<CustomerDocument, 'id' | 'url'>,
    file?: File
  ) => {
    try {
      await firestoreService.addDocumentToCustomer(customerId, documentData, file);
    } catch (error) {
      console.error('Error adding document to customer:', error);
      throw error;
    }
  };

  const updateCollateral = async (
    itineraryId: string,
    collateralId: string,
    updates: Partial<ItineraryCollateral>
  ) => {
    try {
      await firestoreService.updateCollateral(itineraryId, collateralId, updates);
    } catch (error) {
      console.error('Error updating collateral:', error);
      throw error;
    }
  };

  const deleteCollateral = async (itineraryId: string, collateralId: string) => {
    try {
      await firestoreService.deleteCollateral(itineraryId, collateralId);
    } catch (error) {
      console.error('Error deleting collateral:', error);
      throw error;
    }
  };

  const updateBooking = async (bookingId: string, updates: Partial<Booking>) => {
    try {
      await firestoreService.updateBooking(bookingId, updates);
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  };

  const addBooking = async (booking: Omit<Booking, 'id' | 'bookingDate' | 'status' | 'paymentStatus'>) => {
    try {
      await firestoreService.addBooking(booking);
    } catch (error) {
      console.error('Error adding booking:', error);
      throw error;
    }
  };

  // --- AI Feature Simulations ---
  const generateCustomerSummary = async (customer: Customer): Promise<string> => {
    await sleep(1500);
    const customerBookings = bookings.filter(b => b.customerId === customer.id);
    const summary = `This is an AI-generated summary for ${customer.firstName} ${customer.lastName}.\n\n- Primarily interested in travel to destinations like Dubai and the Andaman Islands, as indicated by their booking history.\n- Has completed ${customerBookings.filter(b => b.status === 'Completed').length} trip(s) and currently has ${customerBookings.filter(b => b.status !== 'Completed').length} active booking(s).\n- Document status: ${customer.documents.length > 0 ? `${customer.documents.length} document(s) on file.` : 'No documents uploaded yet, which may be a blocker for upcoming travel.'}`;
    return summary;
  };

  const verifyDocumentWithAi = async (customerId: string, documentId: string): Promise<void> => {
    await sleep(2000);

    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) throw new Error('Customer not found');

      const document = customer.documents.find(doc => doc.id === documentId);
      if (!document) throw new Error('Document not found');

      let newStatus: CustomerDocument['verifiedStatus'];
      let feedback: string;

      if (document.name.toLowerCase().includes('passport')) {
        newStatus = 'Verified';
        feedback = "AI Analysis: Document appears to be a valid Passport. All key fields like name, DOB, and passport number are clear and legible.";
      } else if (document.name.toLowerCase().includes('scan') || document.name.toLowerCase().includes('copy')) {
        newStatus = 'Rejected';
        feedback = "AI Analysis: Document is likely a copy or scan, not an original. Image quality is low, and text appears blurry, which could indicate tampering.";
      } else {
        newStatus = 'Error';
        feedback = "AI Analysis: Could not determine document type with high confidence. Manual review is required.";
      }

      await firestoreService.updateCustomerDocument(customerId, documentId, {
        verifiedStatus: newStatus,
        aiFeedback: feedback,
      });
    } catch (error) {
      console.error('Error verifying document with AI:', error);
      throw error;
    }
  };

  const getCollateralAiFeedback = async (itineraryId: string, collateralId: string): Promise<void> => {
    await sleep(1200);

    try {
      const itinerary = itineraries.find(it => it.id === itineraryId);
      const collateral = itinerary?.collaterals.find(c => c.id === collateralId);

      let feedback: { issuesFound: boolean; feedback: string; };
      if (collateral?.name.toLowerCase().includes('promo')) {
        feedback = {
          issuesFound: true,
          feedback: "Potential Issue: The collateral name contains 'Promotional', which may imply promises that cannot be guaranteed. Recommend reviewing for claims like 'guaranteed sunshine' or 'once-in-a-lifetime'."
        };
      } else {
        feedback = {
          issuesFound: false,
          feedback: "AI Review: No immediate issues detected. The content appears to be factual and aligns with standard marketing guidelines. Recommend a final human review."
        };
      }

      await updateCollateral(itineraryId, collateralId, { aiFeedback: feedback });
    } catch (error) {
      console.error('Error getting collateral AI feedback:', error);
      throw error;
    }
  };

  const getRecommendedItineraries = async (customerId: string): Promise<RecommendedItinerary[]> => {
    await sleep(1800);
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return [];

    const customerBookedItineraryIds = new Set(bookings.filter(b => b.customerId === customerId).map(b => b.itineraryId));

    const recommendations: RecommendedItinerary[] = [];

    // Simple logic: recommend up to 2 itineraries they haven't booked.
    const unbookedItineraries = itineraries.filter(it => !customerBookedItineraryIds.has(it.id));

    if (unbookedItineraries.length > 0) {
      recommendations.push({
        itinerary: unbookedItineraries[0],
        reason: `Based on your interest in exciting destinations, you'll love this trip to ${unbookedItineraries[0].destination}.`
      });
    }

    if (unbookedItineraries.length > 1) {
      // Pick from the end for variety
      const secondRec = unbookedItineraries[unbookedItineraries.length - 1];
      recommendations.push({
        itinerary: secondRec,
        reason: `For a change of pace, consider this relaxing escape to ${secondRec.destination}.`
      });
    }

    return recommendations.slice(0, 2); // Ensure we only return max 2
  };

  const value = {
    users, itineraries, customers, bookings, loading,
    refreshData,
    addUser, updateUser, deleteUser,
    addItinerary, updateItinerary, deleteItinerary,
    addCustomer, updateCustomer, addDocumentToCustomer,
    updateCollateral, deleteCollateral,
    updateBooking, addBooking,
    generateCustomerSummary, verifyDocumentWithAi, getCollateralAiFeedback, getRecommendedItineraries
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};