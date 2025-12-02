import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { UserRole, CollateralType } from '../src/shared/types';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD0HAe0Q7ZNDIoAME0-iP-1Xwa_SzmgSvU",
    authDomain: "travelplan-grav.firebaseapp.com",
    projectId: "travelplan-grav",
    storageBucket: "travelplan-grav.firebasestorage.app",
    messagingSenderId: "848531208932",
    appId: "1:848531208932:web:28bbab98766f81a553caf1",
    measurementId: "G-67MT6WJXQW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initial users data - these should be created via Firebase Auth first
const initialUsers = [
    {
        id: 'user-admin-1',
        name: 'Admin User',
        email: 'admin@travelplans.fun',
        roles: [UserRole.ADMIN],
    },
    {
        id: 'user-agent-1',
        name: 'Travel Agent',
        email: 'agent@travelplans.fun',
        roles: [UserRole.AGENT],
    },
];

// Initial itineraries (empty - will be populated via AI generation)
const initialItineraries: any[] = [];

// Initial customers (empty - will be created through the application)
const initialCustomers: any[] = [];

// Initial bookings (empty - will be created through the application)
const initialBookings: any[] = [];

async function seedData() {
    try {
        console.log('Starting data seeding...');
        const batch = writeBatch(db);

        // Seed users
        if (initialUsers.length > 0) {
            console.log(`Seeding ${initialUsers.length} users...`);
            initialUsers.forEach(user => {
                const userRef = doc(collection(db, 'users'), user.id);
                batch.set(userRef, {
                    name: user.name,
                    email: user.email,
                    roles: user.roles,
                });
            });
        }

        // Seed itineraries
        if (initialItineraries.length > 0) {
            console.log(`Seeding ${initialItineraries.length} itineraries...`);
            initialItineraries.forEach(itinerary => {
                const { id, ...itineraryData } = itinerary;
                const itineraryRef = doc(collection(db, 'itineraries'), id);
                batch.set(itineraryRef, {
                    ...itineraryData,
                    collaterals: itineraryData.collaterals || [],
                });
            });
        }

        // Seed customers
        if (initialCustomers.length > 0) {
            console.log(`Seeding ${initialCustomers.length} customers...`);
            initialCustomers.forEach(customer => {
                const { id, ...customerData } = customer;
                const customerRef = doc(collection(db, 'customers'), id);
                batch.set(customerRef, {
                    ...customerData,
                    registrationDate: Timestamp.fromDate(new Date(customerData.registrationDate)),
                    dob: Timestamp.fromDate(new Date(customerData.dob)),
                    documents: customerData.documents || [],
                });
            });
        }

        // Seed bookings
        if (initialBookings.length > 0) {
            console.log(`Seeding ${initialBookings.length} bookings...`);
            initialBookings.forEach(booking => {
                const { id, ...bookingData } = booking;
                const bookingRef = doc(collection(db, 'bookings'), id);
                batch.set(bookingRef, {
                    ...bookingData,
                    bookingDate: Timestamp.fromDate(new Date(bookingData.bookingDate)),
                });
            });
        }

        await batch.commit();
        console.log('Data seeding completed successfully!');
        console.log('Note: Users need to be created in Firebase Auth separately.');
        console.log('Note: Use the application UI to create customers, itineraries, and bookings.');
    } catch (error) {
        console.error('Error seeding data:', error);
        throw error;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedData().then(() => {
        console.log('Seeding complete');
        process.exit(0);
    }).catch((error) => {
        console.error('Seeding failed:', error);
        process.exit(1);
    });
}

export { seedData };
