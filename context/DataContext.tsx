import React, { createContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User, Itinerary, Customer, Booking, ItineraryCollateral, CustomerDocument, RecommendedItinerary } from '../types';
import * as firestoreService from '../services/firestoreService';

// AI Simulation Helpers
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface DataContextType {
  users: User[];
  itineraries: Itinerary[];
  customers: Customer[];
  bookings: Booking[];
  loading: boolean;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
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
  const [users, setUsers] = useState<User[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const initialLoadFlags = useRef({ users: false, itineraries: false, customers: false, bookings: false });

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    setLoading(true);
    // Reset flags when component mounts
    initialLoadFlags.current = { users: false, itineraries: false, customers: false, bookings: false };

    const checkAllLoaded = () => {
      if (initialLoadFlags.current.users && 
          initialLoadFlags.current.itineraries && 
          initialLoadFlags.current.customers && 
          initialLoadFlags.current.bookings) {
        setLoading(false);
      }
    };

    const unsubscribeUsers = firestoreService.subscribeToUsers((updatedUsers) => {
      setUsers(updatedUsers);
      if (!initialLoadFlags.current.users) {
        initialLoadFlags.current.users = true;
        checkAllLoaded();
      }
    });

    const unsubscribeItineraries = firestoreService.subscribeToItineraries((updatedItineraries) => {
      setItineraries(updatedItineraries);
      if (!initialLoadFlags.current.itineraries) {
        initialLoadFlags.current.itineraries = true;
        checkAllLoaded();
      }
    });

    const unsubscribeCustomers = firestoreService.subscribeToCustomers((updatedCustomers) => {
      setCustomers(updatedCustomers);
      if (!initialLoadFlags.current.customers) {
        initialLoadFlags.current.customers = true;
        checkAllLoaded();
      }
    });

    const unsubscribeBookings = firestoreService.subscribeToBookings((updatedBookings) => {
      setBookings(updatedBookings);
      if (!initialLoadFlags.current.bookings) {
        initialLoadFlags.current.bookings = true;
        checkAllLoaded();
      }
    });

    // Fallback: Set loading to false after 3 seconds even if some subscriptions haven't fired
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeUsers();
      unsubscribeItineraries();
      unsubscribeCustomers();
      unsubscribeBookings();
      clearTimeout(timer);
    };
  }, []);

  // --- CRUD Functions ---
  const addUser = async (user: Omit<User, 'id'>) => {
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
      await firestoreService.deleteUser(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const addItinerary = async (itinerary: Omit<Itinerary, 'id'>) => {
    try {
      const itineraryData = {
        ...itinerary,
        description: itinerary.description || '',
        assignedAgentId: itinerary.assignedAgentId || undefined,
        imageUrl: itinerary.imageUrl || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070',
        collaterals: itinerary.collaterals || [],
      };
      await firestoreService.addItinerary(itineraryData);
    } catch (error) {
      console.error('Error adding itinerary:', error);
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
      const customerData = {
        ...customer,
        assignedRmId: customer.assignedRmId || undefined,
      };
      await firestoreService.addCustomer(customerData);
    } catch (error) {
      console.error('Error adding customer:', error);
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
    addUser, updateUser, deleteUser,
    addItinerary, updateItinerary, deleteItinerary,
    addCustomer, updateCustomer, addDocumentToCustomer,
    updateCollateral, deleteCollateral,
    updateBooking, addBooking,
    generateCustomerSummary, verifyDocumentWithAi, getCollateralAiFeedback, getRecommendedItineraries
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};