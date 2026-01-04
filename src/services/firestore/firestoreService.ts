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
    deleteField,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import {
    User,
    Itinerary,
    Customer,
    Booking,
    CustomerDocument,
    ItineraryCollateral,
} from '../../shared/types';
import { createUser as createUserAPI, CreateUserParams } from '../api/aiService';

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
    console.log('[subscribeToUsers] Setting up real-time subscription');
    
    return onSnapshot(
        usersRef, 
        {
            includeMetadataChanges: true // Include metadata changes to ensure all updates are captured
        },
        (snapshot: QuerySnapshot<DocumentData>) => {
            console.log('[subscribeToUsers] Snapshot received:', {
                size: snapshot.size,
                fromCache: snapshot.metadata.fromCache,
                hasPendingWrites: snapshot.metadata.hasPendingWrites
            });
            
            const users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as User[];
            
            console.log('[subscribeToUsers] Calling callback with', users.length, 'users');
            callback(users);
        },
        (error) => {
            console.error('[subscribeToUsers] Subscription error:', error);
            if (error.code !== 'permission-denied') {
                console.error('Error subscribing to users:', error);
            }
            callback([]);
        }
    );
};

export const addUser = async (user: Omit<User, 'id'> & { password?: string }): Promise<string> => {
    if (user.password) {
        // Use Cloud Function to create user with password
        console.log('[addUser] Creating user via Cloud Function (password provided)');
        try {
            const createUserParams: CreateUserParams = {
                email: user.email,
                password: user.password,
                name: user.name,
                countryCode: user.countryCode || '+971',
                contactNumber: user.contactNumber || '',
                roles: user.roles || [],
                customRoles: user.customRoles || [],
            };
            const response = await createUserAPI(createUserParams);
            console.log('[addUser] User created via Cloud Function:', response.uid);
            return response.uid;
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to create user';
            console.error('[addUser] Cloud Function error:', errorMessage);
            throw new Error(`${errorMessage}. Please ensure the Cloud Function is deployed.`);
        }
    } else {
        // For users without password (e.g., existing users being added to Firestore)
        console.log('[addUser] Creating Firestore document only (no password provided)');
        
        // Build user data explicitly, ensuring required fields
        const userData: any = {
            name: user.name,
            email: user.email,
            countryCode: user.countryCode || '+971',
            contactNumber: user.contactNumber || '',
            roles: user.roles || [],
        };
        
        // Only include optional fields if they have values
        if (user.customRoles && user.customRoles.length > 0) {
            userData.customRoles = user.customRoles;
        }
        if (user.permissions && user.permissions.length > 0) {
            userData.permissions = user.permissions;
        }
        
        // Remove any undefined values
        Object.keys(userData).forEach(key => {
            if (userData[key] === undefined || userData[key] === null) {
                delete userData[key];
            }
        });
        
        const usersRef = collection(db, COLLECTIONS.USERS);
        const docRef = await addDoc(usersRef, userData);
        console.log('[addUser] Firestore document created:', docRef.id);
        return docRef.id;
    }
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    
    // Remove undefined values - Firebase doesn't allow undefined
    const cleanedUpdates: any = {};
    Object.keys(updates).forEach(key => {
        const value = (updates as any)[key];
        if (value !== undefined && value !== null) {
            cleanedUpdates[key] = value;
        }
    });
    
    // If useSameAsContact is true, explicitly delete WhatsApp-specific fields
    if (cleanedUpdates.useSameAsContact === true) {
        cleanedUpdates.whatsappCountryCode = deleteField();
        cleanedUpdates.whatsappNumber = deleteField();
    }
    
    if (Object.keys(cleanedUpdates).length === 0) {
        console.warn('[updateUser] No valid updates to apply');
        return;
    }
    
    console.log('[updateUser] Updating user with cleaned data:', cleanedUpdates);
    await updateDoc(userRef, cleanedUpdates);
};

export const deleteUser = async (userId: string, userEmail?: string): Promise<void> => {
    // Prevent deletion of the primary admin account
    if (userEmail === 'mail@jsabu.com') {
        throw new Error('Cannot delete the primary admin account (mail@jsabu.com).');
    }
    
    // If email not provided, fetch user to check
    if (!userEmail) {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.email === 'mail@jsabu.com') {
                throw new Error('Cannot delete the primary admin account (mail@jsabu.com).');
            }
        }
    }
    
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
    console.log('[subscribeToItineraries] Setting up subscription to itineraries collection');
    
    // Try a direct query first to verify access
    getDocs(itinerariesRef).then((snapshot) => {
        console.log('[subscribeToItineraries] Initial query successful:', {
            size: snapshot.size,
            empty: snapshot.empty
        });
    }).catch((error) => {
        console.error('[subscribeToItineraries] Initial query failed:', error);
    });
    
    return onSnapshot(
        itinerariesRef, 
        {
            includeMetadataChanges: true // Include metadata changes to ensure all updates are captured
        },
        (snapshot: QuerySnapshot<DocumentData>) => {
            console.log('[subscribeToItineraries] Snapshot received:', {
                size: snapshot.size,
                empty: snapshot.empty,
                hasPendingWrites: snapshot.metadata.hasPendingWrites,
                fromCache: snapshot.metadata.fromCache,
                docChanges: snapshot.docChanges().map(change => ({
                    type: change.type,
                    docId: change.doc.id,
                    title: change.doc.data().title
                }))
            });
            
            if (snapshot.empty) {
                console.warn('[subscribeToItineraries] Snapshot is empty - no itineraries found');
                callback([]);
                return;
            }
            
            const itineraries = snapshot.docs.map(doc => {
                const data = doc.data();
                const docChanges = snapshot.docChanges();
                const change = docChanges.find(c => c.doc.id === doc.id);
                
                console.log('[subscribeToItineraries] Processing document:', {
                    id: doc.id,
                    title: data.title,
                    destination: data.destination,
                    changeType: change?.type || 'unknown',
                    assignedAgentIds: data.assignedAgentIds,
                    assignedAgentId: data.assignedAgentId,
                    hasAllFields: !!(data.title && data.destination && data.duration !== undefined && data.price !== undefined)
                });
                
                // Ensure all required fields are present with defaults
                const itinerary: Itinerary = {
                    id: doc.id,
                    title: data.title || 'Untitled Itinerary',
                    destination: data.destination || 'Unknown',
                    duration: typeof data.duration === 'number' ? data.duration : (parseInt(data.duration) || 0),
                    price: typeof data.price === 'number' ? data.price : (parseFloat(data.price) || 0),
                    description: data.description || '',
                    imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070',
                    collaterals: Array.isArray(data.collaterals) ? data.collaterals : [],
                };
                
                // Include dailyPlan if it exists (for AI-generated itineraries)
                if (data.dailyPlan && Array.isArray(data.dailyPlan)) {
                    itinerary.dailyPlan = data.dailyPlan;
                }
                
                // Support both old (assignedAgentId) and new (assignedAgentIds) format
                if (data.assignedAgentIds && Array.isArray(data.assignedAgentIds)) {
                    itinerary.assignedAgentIds = data.assignedAgentIds;
                    console.log('[subscribeToItineraries] Itinerary', doc.id, 'has assignedAgentIds:', data.assignedAgentIds);
                } else if (data.assignedAgentId) {
                    // Migrate from old format to new format
                    itinerary.assignedAgentIds = [data.assignedAgentId];
                    itinerary.assignedAgentId = data.assignedAgentId; // Keep for backward compatibility
                    console.log('[subscribeToItineraries] Itinerary', doc.id, 'migrated from assignedAgentId:', data.assignedAgentId);
                } else {
                    console.log('[subscribeToItineraries] Itinerary', doc.id, 'has no assigned agents');
                }
                
                return itinerary;
            });
            
            console.log('[subscribeToItineraries] Calling callback with', itineraries.length, 'itineraries:', 
                itineraries.map(it => ({ 
                    id: it.id, 
                    title: it.title,
                    assignedAgentIds: it.assignedAgentIds,
                    assignedAgentId: it.assignedAgentId
                }))
            );
            // Always call callback, even if empty, to ensure UI updates
            callback(itineraries);
        },
        (error) => {
            console.error('[subscribeToItineraries] Error in subscription:', {
                code: error.code,
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            
            // Only clear the list for permission errors, not for other errors
            if (error.code === 'permission-denied') {
                console.warn('[subscribeToItineraries] Permission denied - clearing list');
                callback([]);
            } else {
                // For other errors, try to fetch once more as fallback
                console.error('[subscribeToItineraries] Non-permission error - attempting fallback query');
                getDocs(itinerariesRef).then((snapshot) => {
                    const itineraries = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Itinerary[];
                    console.log('[subscribeToItineraries] Fallback query successful, got', itineraries.length, 'itineraries');
                    callback(itineraries);
                }).catch((fallbackError) => {
                    console.error('[subscribeToItineraries] Fallback query also failed:', fallbackError);
                    // Don't clear - keep existing data
                });
            }
        }
    );
};

/**
 * Subscribe to itineraries for an Agent (assigned itineraries only).
 * This avoids permission-denied errors from querying the whole collection.
 */
export const subscribeToItinerariesForAgent = (
    agentId: string,
    callback: (itineraries: Itinerary[]) => void
): Unsubscribe => {
    const itinerariesRef = collection(db, COLLECTIONS.ITINERARIES);
    console.log('[subscribeToItinerariesForAgent] Setting up agent-only subscriptions:', { agentId });

    const byNewFormat = query(itinerariesRef, where('assignedAgentIds', 'array-contains', agentId));
    const byOldFormat = query(itinerariesRef, where('assignedAgentId', '==', agentId));

    let latestNew: Itinerary[] = [];
    let latestOld: Itinerary[] = [];

    const normalize = (snapshot: QuerySnapshot<DocumentData>): Itinerary[] => {
        return snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            const itinerary: Itinerary = {
                id: docSnap.id,
                title: data.title || 'Untitled Itinerary',
                destination: data.destination || 'Unknown',
                duration: typeof data.duration === 'number' ? data.duration : (parseInt(data.duration) || 0),
                price: typeof data.price === 'number' ? data.price : (parseFloat(data.price) || 0),
                description: data.description || '',
                imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070',
                collaterals: Array.isArray(data.collaterals) ? data.collaterals : [],
            };

            if (data.dailyPlan && Array.isArray(data.dailyPlan)) {
                itinerary.dailyPlan = data.dailyPlan;
            }

            // Normalize assignment fields
            if (data.assignedAgentIds && Array.isArray(data.assignedAgentIds)) {
                itinerary.assignedAgentIds = data.assignedAgentIds;
            } else if (data.assignedAgentId) {
                itinerary.assignedAgentIds = [data.assignedAgentId];
                itinerary.assignedAgentId = data.assignedAgentId;
            }

            return itinerary;
        });
    };

    const emitMerged = () => {
        const merged = new Map<string, Itinerary>();
        for (const it of latestNew) merged.set(it.id, it);
        for (const it of latestOld) merged.set(it.id, it);
        callback(Array.from(merged.values()));
    };

    const unsub1 = onSnapshot(
        byNewFormat,
        { includeMetadataChanges: true },
        (snapshot) => {
            latestNew = normalize(snapshot);
            emitMerged();
        },
        (error) => {
            console.error('[subscribeToItinerariesForAgent] New-format subscription error:', error);
            latestNew = [];
            emitMerged();
        }
    );

    const unsub2 = onSnapshot(
        byOldFormat,
        { includeMetadataChanges: true },
        (snapshot) => {
            latestOld = normalize(snapshot);
            emitMerged();
        },
        (error) => {
            console.error('[subscribeToItinerariesForAgent] Old-format subscription error:', error);
            latestOld = [];
            emitMerged();
        }
    );

    return () => {
        unsub1();
        unsub2();
    };
};

export const addItinerary = async (itinerary: Omit<Itinerary, 'id'>): Promise<string> => {
    console.log('[firestoreService] Adding itinerary:', { 
        title: itinerary.title, 
        destination: itinerary.destination 
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
    
    // Final safety check - remove any undefined, null, or id values
    Object.keys(itineraryData).forEach(key => {
        if (itineraryData[key] === undefined || itineraryData[key] === null || key === 'id') {
            delete itineraryData[key];
        }
    });
    
    // Explicitly ensure id is not included
    delete itineraryData.id;
    
    console.log('[firestoreService] Final itinerary data for Firestore:', itineraryData);
    
    const itinerariesRef = collection(db, COLLECTIONS.ITINERARIES);
    const docRef = await addDoc(itinerariesRef, itineraryData);
    console.log('[firestoreService] Itinerary document created with ID:', docRef.id);
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

// Direct fetch function for debugging
export const fetchItinerariesDirectly = async (): Promise<Itinerary[]> => {
    try {
        console.log('[fetchItinerariesDirectly] Fetching itineraries directly...');
        const itinerariesRef = collection(db, COLLECTIONS.ITINERARIES);
        const snapshot = await getDocs(itinerariesRef);
        console.log('[fetchItinerariesDirectly] Direct query result:', {
            size: snapshot.size,
            empty: snapshot.empty
        });
        
        const itineraries = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title || 'Untitled Itinerary',
                destination: data.destination || 'Unknown',
                duration: typeof data.duration === 'number' ? data.duration : (parseInt(data.duration) || 0),
                price: typeof data.price === 'number' ? data.price : (parseFloat(data.price) || 0),
                description: data.description || '',
                imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070',
                collaterals: Array.isArray(data.collaterals) ? data.collaterals : [],
                assignedAgentId: data.assignedAgentId || undefined,
            } as Itinerary;
        });
        
        console.log('[fetchItinerariesDirectly] Returning', itineraries.length, 'itineraries');
        return itineraries;
    } catch (error) {
        console.error('[fetchItinerariesDirectly] Error:', error);
        throw error;
    }
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
    console.log('[subscribeToCustomers] Setting up real-time subscription');
    
    return onSnapshot(
        customersRef,
        {
            includeMetadataChanges: true // Include metadata changes to ensure all updates are captured
        },
        (snapshot: QuerySnapshot<DocumentData>) => {
            console.log('[subscribeToCustomers] Snapshot received:', {
                size: snapshot.size,
                fromCache: snapshot.metadata.fromCache,
                hasPendingWrites: snapshot.metadata.hasPendingWrites
            });
            
            const customers = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    dob: data.dob,
                    registrationDate: timestampToString(data.registrationDate),
                    registeredByAgentId: data.registeredByAgentId,
                    assignedRmId: data.assignedRmId || undefined,
                    bookingStatus: data.bookingStatus || 'Pending',
                    documents: Array.isArray(data.documents) ? data.documents : [],
                } as Customer;
            });
            
            console.log('[subscribeToCustomers] Calling callback with', customers.length, 'customers');
            callback(customers);
        },
        (error) => {
            console.error('[subscribeToCustomers] Error in subscription:', error);
            if (error.code !== 'permission-denied') {
                console.error('Error subscribing to customers:', error);
            }
            callback([]);
        }
    );
};

export const addCustomer = async (customer: Omit<Customer, 'id' | 'bookingStatus' | 'documents' | 'registrationDate'>): Promise<string> => {
    console.log('[firestoreService] Adding customer:', { 
        firstName: customer.firstName, 
        lastName: customer.lastName,
        email: customer.email,
        hasAssignedRmId: !!customer.assignedRmId 
    });
    
    // Build customer data explicitly, excluding undefined values
    const customerData: any = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        dob: customer.dob,
        registeredByAgentId: customer.registeredByAgentId,
        registrationDate: Timestamp.now(),
        bookingStatus: 'Pending',
        documents: [],
    };
    
    // Only include assignedRmId if it has a truthy value
    if (customer.assignedRmId) {
        customerData.assignedRmId = customer.assignedRmId;
    }
    
    // Final safety check - remove any undefined or null values
    Object.keys(customerData).forEach(key => {
        if (customerData[key] === undefined || customerData[key] === null) {
            delete customerData[key];
        }
    });
    
    console.log('[firestoreService] Final customer data for Firestore:', customerData);
    
    const customersRef = collection(db, COLLECTIONS.CUSTOMERS);
    const docRef = await addDoc(customersRef, customerData);
    console.log('[firestoreService] Customer document created with ID:', docRef.id);
    return docRef.id;
};

export const updateCustomer = async (customerId: string, updates: Partial<Customer>): Promise<void> => {
    const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    
    // Convert any ISO string dates back to Timestamp if needed
    const updateData: any = { ...updates };
    if (updateData.registrationDate && typeof updateData.registrationDate === 'string') {
        updateData.registrationDate = Timestamp.fromDate(new Date(updateData.registrationDate));
    }
    
    await updateDoc(customerRef, updateData);
};

export const deleteCustomer = async (customerId: string): Promise<void> => {
    const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    await deleteDoc(customerRef);
};

export const getCustomerById = async (customerId: string): Promise<Customer | null> => {
    const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    const customerSnap = await getDoc(customerRef);
    if (customerSnap.exists()) {
        const data = customerSnap.data();
        return {
            id: customerSnap.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            dob: data.dob,
            registrationDate: timestampToString(data.registrationDate),
            registeredByAgentId: data.registeredByAgentId,
            assignedRmId: data.assignedRmId || undefined,
            bookingStatus: data.bookingStatus || 'Pending',
            documents: Array.isArray(data.documents) ? data.documents : [],
        } as Customer;
    }
    return null;
};

export const addDocumentToCustomer = async (
    customerId: string,
    documentData: Omit<CustomerDocument, 'id' | 'url'>,
    file?: File
): Promise<void> => {
    const customer = await getCustomerById(customerId);
    if (!customer) throw new Error('Customer not found');

    let documentUrl = '';
    if (file) {
        const storageRef = ref(storage, `customers/${customerId}/documents/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        documentUrl = await getDownloadURL(storageRef);
    }

    const newDocument: CustomerDocument = {
        id: Date.now().toString(),
        ...documentData,
        url: documentUrl,
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
    console.log('[subscribeToBookings] Setting up real-time subscription');
    
    return onSnapshot(
        bookingsRef,
        {
            includeMetadataChanges: true // Include metadata changes to ensure all updates are captured
        },
        (snapshot: QuerySnapshot<DocumentData>) => {
            console.log('[subscribeToBookings] Snapshot received:', {
                size: snapshot.size,
                empty: snapshot.empty,
                fromCache: snapshot.metadata.fromCache,
                hasPendingWrites: snapshot.metadata.hasPendingWrites
            });
            
            if (snapshot.empty) {
                console.warn('[subscribeToBookings] Snapshot is empty - no bookings found');
                callback([]);
                return;
            }
            
            const bookings = snapshot.docs.map(doc => {
                const data = doc.data();
                console.log('[subscribeToBookings] Processing document:', {
                    id: doc.id,
                    customerId: data.customerId,
                    itineraryId: data.itineraryId,
                    status: data.status
                });
                
                return {
                    id: doc.id,
                    customerId: data.customerId,
                    itineraryId: data.itineraryId,
                    bookingDate: timestampToString(data.bookingDate),
                    status: data.status || 'Pending',
                    paymentStatus: data.paymentStatus || 'Unpaid',
                } as Booking;
            });
            
            console.log('[subscribeToBookings] Calling callback with', bookings.length, 'bookings');
            callback(bookings);
        },
        (error) => {
            console.error('[subscribeToBookings] Error in subscription:', {
                code: error.code,
                message: error.message,
                name: error.name
            });
            
            if (error.code === 'permission-denied') {
                console.warn('[subscribeToBookings] Permission denied - clearing list');
                callback([]);
            } else {
                // For other errors, try to fetch once more as fallback
                console.error('[subscribeToBookings] Non-permission error - attempting fallback query');
                getDocs(bookingsRef).then((snapshot) => {
                    const bookings = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            customerId: data.customerId,
                            itineraryId: data.itineraryId,
                            bookingDate: timestampToString(data.bookingDate),
                            status: data.status || 'Pending',
                            paymentStatus: data.paymentStatus || 'Unpaid',
                        } as Booking;
                    });
                    console.log('[subscribeToBookings] Fallback query successful, got', bookings.length, 'bookings');
                    callback(bookings);
                }).catch((fallbackError) => {
                    console.error('[subscribeToBookings] Fallback query also failed:', fallbackError);
                    // Don't clear - keep existing data
                });
            }
        }
    );
};

export const addBooking = async (
    booking: Omit<Booking, 'id' | 'bookingDate' | 'status' | 'paymentStatus'>
): Promise<string> => {
    console.log('[addBooking] Adding booking:', {
        customerId: booking.customerId,
        itineraryId: booking.itineraryId
    });
    
    // Build booking data explicitly, excluding undefined values
    const bookingData: any = {
        customerId: booking.customerId,
        itineraryId: booking.itineraryId,
        bookingDate: Timestamp.now(),
        status: 'Pending',
        paymentStatus: 'Unpaid',
    };
    
    // Remove any undefined values
    Object.keys(bookingData).forEach(key => {
        if (bookingData[key] === undefined || bookingData[key] === null) {
            delete bookingData[key];
        }
    });
    
    console.log('[addBooking] Final booking data for Firestore:', bookingData);
    
    const bookingsRef = collection(db, COLLECTIONS.BOOKINGS);
    const docRef = await addDoc(bookingsRef, bookingData);
    console.log('[addBooking] Booking document created with ID:', docRef.id);
    return docRef.id;
};

export const updateBooking = async (
    bookingId: string,
    updates: Partial<Booking>
): Promise<void> => {
    const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
    
    // Convert bookingDate if it's a string
    const updateData: any = { ...updates };
    if (updateData.bookingDate && typeof updateData.bookingDate === 'string') {
        updateData.bookingDate = Timestamp.fromDate(new Date(updateData.bookingDate));
    }
    
    await updateDoc(bookingRef, updateData);
};

export const deleteBooking = async (bookingId: string): Promise<void> => {
    const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
    await deleteDoc(bookingRef);
};
