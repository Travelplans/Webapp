import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    onSnapshot,
    writeBatch,
    Timestamp,
    DocumentData,
    QuerySnapshot,
    Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import {
    User,
    Itinerary,
    Customer,
    Booking,
    CustomerDocument,
    ItineraryCollateral,
} from '../types';

// Collection names
const COLLECTIONS = {
    USERS: 'users',
    ITINERARIES: 'itineraries',
    CUSTOMERS: 'customers',
    BOOKINGS: 'bookings',
} as const;

// Helper to convert Firestore timestamp to ISO string
const timestampToString = (timestamp: any): string => {
    if (timestamp?.toDate) {
        return timestamp.toDate().toISOString();
    }
    return timestamp || new Date().toISOString();
};

// ==================== USERS ====================

export const subscribeToUsers = (callback: (users: User[]) => void): Unsubscribe => {
    const usersRef = collection(db, COLLECTIONS.USERS);
    return onSnapshot(usersRef, (snapshot: QuerySnapshot<DocumentData>) => {
        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as User[];
        callback(users);
    });
};

export const addUser = async (user: Omit<User, 'id'>): Promise<string> => {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const docRef = await addDoc(usersRef, user);
    return docRef.id;
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, updates);
};

export const deleteUser = async (userId: string): Promise<void> => {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await deleteDoc(userRef);
};

export const getUserById = async (userId: string): Promise<User | null> => {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() } as User;
    }
    return null;
};

// ==================== ITINERARIES ====================

export const subscribeToItineraries = (callback: (itineraries: Itinerary[]) => void): Unsubscribe => {
    const itinerariesRef = collection(db, COLLECTIONS.ITINERARIES);
    return onSnapshot(itinerariesRef, (snapshot: QuerySnapshot<DocumentData>) => {
        const itineraries = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Itinerary[];
        callback(itineraries);
    });
};

export const addItinerary = async (itinerary: Omit<Itinerary, 'id'>): Promise<string> => {
    const itinerariesRef = collection(db, COLLECTIONS.ITINERARIES);
    const docRef = await addDoc(itinerariesRef, {
        ...itinerary,
        collaterals: itinerary.collaterals || [],
    });
    return docRef.id;
};

export const updateItinerary = async (
    itineraryId: string,
    updates: Partial<Itinerary>
): Promise<void> => {
    const itineraryRef = doc(db, COLLECTIONS.ITINERARIES, itineraryId);
    await updateDoc(itineraryRef, updates);
};

export const deleteItinerary = async (itineraryId: string): Promise<void> => {
    const itineraryRef = doc(db, COLLECTIONS.ITINERARIES, itineraryId);
    await deleteDoc(itineraryRef);
};

export const getItineraryById = async (itineraryId: string): Promise<Itinerary | null> => {
    const itineraryRef = doc(db, COLLECTIONS.ITINERARIES, itineraryId);
    const itinerarySnap = await getDoc(itineraryRef);
    if (itinerarySnap.exists()) {
        return { id: itinerarySnap.id, ...itinerarySnap.data() } as Itinerary;
    }
    return null;
};

// Collateral operations
export const updateCollateral = async (
    itineraryId: string,
    collateralId: string,
    updates: Partial<ItineraryCollateral>
): Promise<void> => {
    const itinerary = await getItineraryById(itineraryId);
    if (!itinerary) throw new Error('Itinerary not found');

    const updatedCollaterals = itinerary.collaterals.map(c =>
        c.id === collateralId ? { ...c, ...updates } : c
    );

    await updateItinerary(itineraryId, { collaterals: updatedCollaterals });
};

export const deleteCollateral = async (
    itineraryId: string,
    collateralId: string
): Promise<void> => {
    const itinerary = await getItineraryById(itineraryId);
    if (!itinerary) throw new Error('Itinerary not found');

    const updatedCollaterals = itinerary.collaterals.filter(c => c.id !== collateralId);
    await updateItinerary(itineraryId, { collaterals: updatedCollaterals });
};

// ==================== CUSTOMERS ====================

export const subscribeToCustomers = (callback: (customers: Customer[]) => void): Unsubscribe => {
    const customersRef = collection(db, COLLECTIONS.CUSTOMERS);
    return onSnapshot(customersRef, (snapshot: QuerySnapshot<DocumentData>) => {
        const customers = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                registrationDate: timestampToString(data.registrationDate),
                dob: timestampToString(data.dob),
                documents: data.documents || [],
            };
        }) as Customer[];
        callback(customers);
    });
};

export const addCustomer = async (
    customer: Omit<Customer, 'id' | 'bookingStatus' | 'documents' | 'registrationDate'>
): Promise<string> => {
    const customersRef = collection(db, COLLECTIONS.CUSTOMERS);
    const docRef = await addDoc(customersRef, {
        ...customer,
        bookingStatus: 'Pending',
        documents: [],
        registrationDate: Timestamp.now(),
    });
    return docRef.id;
};

export const updateCustomer = async (
    customerId: string,
    updates: Partial<Customer>
): Promise<void> => {
    const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    await updateDoc(customerRef, updates);
};

export const getCustomerById = async (customerId: string): Promise<Customer | null> => {
    const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    const customerSnap = await getDoc(customerRef);
    if (customerSnap.exists()) {
        const data = customerSnap.data();
        return {
            id: customerSnap.id,
            ...data,
            registrationDate: timestampToString(data.registrationDate),
            dob: timestampToString(data.dob),
            documents: data.documents || [],
        } as Customer;
    }
    return null;
};

// Document operations
export const addDocumentToCustomer = async (
    customerId: string,
    documentData: Omit<CustomerDocument, 'id' | 'url'>,
    file?: File
): Promise<void> => {
    const customer = await getCustomerById(customerId);
    if (!customer) throw new Error('Customer not found');

    let documentUrl = '#';

    // Upload file to Firebase Storage if provided
    if (file) {
        const storageRef = ref(storage, `customer-documents/${customerId}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        documentUrl = await getDownloadURL(storageRef);
    }

    const newDocument: CustomerDocument = {
        ...documentData,
        id: `doc-${Date.now()}`,
        url: documentUrl,
        verifiedStatus: 'Pending',
    };

    const updatedDocuments = [...customer.documents, newDocument];
    await updateCustomer(customerId, { documents: updatedDocuments });
};

export const updateCustomerDocument = async (
    customerId: string,
    documentId: string,
    updates: Partial<CustomerDocument>
): Promise<void> => {
    const customer = await getCustomerById(customerId);
    if (!customer) throw new Error('Customer not found');

    const updatedDocuments = customer.documents.map(doc =>
        doc.id === documentId ? { ...doc, ...updates } : doc
    );

    await updateCustomer(customerId, { documents: updatedDocuments });
};

// ==================== BOOKINGS ====================

export const subscribeToBookings = (callback: (bookings: Booking[]) => void): Unsubscribe => {
    const bookingsRef = collection(db, COLLECTIONS.BOOKINGS);
    return onSnapshot(bookingsRef, (snapshot: QuerySnapshot<DocumentData>) => {
        const bookings = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                bookingDate: timestampToString(data.bookingDate),
            };
        }) as Booking[];
        callback(bookings);
    });
};

export const addBooking = async (
    booking: Omit<Booking, 'id' | 'bookingDate' | 'status' | 'paymentStatus'>
): Promise<string> => {
    const bookingsRef = collection(db, COLLECTIONS.BOOKINGS);
    const docRef = await addDoc(bookingsRef, {
        ...booking,
        bookingDate: Timestamp.now(),
        status: 'Pending',
        paymentStatus: 'Unpaid',
    });
    return docRef.id;
};

export const updateBooking = async (
    bookingId: string,
    updates: Partial<Booking>
): Promise<void> => {
    const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
    await updateDoc(bookingRef, updates);
};

export const getBookingById = async (bookingId: string): Promise<Booking | null> => {
    const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
    const bookingSnap = await getDoc(bookingRef);
    if (bookingSnap.exists()) {
        const data = bookingSnap.data();
        return {
            id: bookingSnap.id,
            ...data,
            bookingDate: timestampToString(data.bookingDate),
        } as Booking;
    }
    return null;
};

export const getBookingsByCustomer = async (customerId: string): Promise<Booking[]> => {
    const bookingsRef = collection(db, COLLECTIONS.BOOKINGS);
    const q = query(bookingsRef, where('customerId', '==', customerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            bookingDate: timestampToString(data.bookingDate),
        };
    }) as Booking[];
};

// ==================== BATCH OPERATIONS ====================

export const initializeDatabase = async (initialData: {
    users?: User[];
    itineraries?: Itinerary[];
    customers?: Customer[];
    bookings?: Booking[];
}): Promise<void> => {
    const batch = writeBatch(db);

    // Add users
    if (initialData.users) {
        initialData.users.forEach(user => {
            const { id, ...userData } = user;
            const userRef = doc(collection(db, COLLECTIONS.USERS));
            batch.set(userRef, userData);
        });
    }

    // Add itineraries
    if (initialData.itineraries) {
        initialData.itineraries.forEach(itinerary => {
            const { id, ...itineraryData } = itinerary;
            const itineraryRef = doc(collection(db, COLLECTIONS.ITINERARIES));
            batch.set(itineraryRef, itineraryData);
        });
    }

    // Add customers
    if (initialData.customers) {
        initialData.customers.forEach(customer => {
            const { id, ...customerData } = customer;
            const customerRef = doc(collection(db, COLLECTIONS.CUSTOMERS));
            batch.set(customerRef, {
                ...customerData,
                registrationDate: Timestamp.now(),
            });
        });
    }

    // Add bookings
    if (initialData.bookings) {
        initialData.bookings.forEach(booking => {
            const { id, ...bookingData } = booking;
            const bookingRef = doc(collection(db, COLLECTIONS.BOOKINGS));
            batch.set(bookingRef, {
                ...bookingData,
                bookingDate: Timestamp.now(),
            });
        });
    }

    await batch.commit();
};
