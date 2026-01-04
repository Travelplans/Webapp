// Script to create a test agent with sample data for walkthrough testing
// Run with: node scripts/createTestAgent.js
// Note: This uses Firebase Admin SDK - requires service account or GOOGLE_APPLICATION_CREDENTIALS

import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    } catch (error) {
        console.error('Firebase Admin initialization error:', error);
        console.error('Please set GOOGLE_APPLICATION_CREDENTIALS or use service account key');
        process.exit(1);
    }
}

const auth = admin.auth();
const firestore = admin.firestore();

// Test Agent Credentials
const TEST_AGENT = {
    email: 'testagent@travelplans.fun',
    password: 'TestAgent@123',
    name: 'Test Agent (Walkthrough)',
    countryCode: '+971',
    contactNumber: '501234567',
    roles: ['Agent']
};

async function createTestAgent() {
    try {
        console.log('🚀 Creating test agent for walkthrough...\n');

        // Step 1: Create Auth User
        let user;
        try {
            user = await auth.getUserByEmail(TEST_AGENT.email);
            console.log(`✅ User ${TEST_AGENT.email} already exists`);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                user = await auth.createUser({
                    email: TEST_AGENT.email,
                    password: TEST_AGENT.password,
                    displayName: TEST_AGENT.name,
                    emailVerified: true,
                });
                console.log(`✅ Created Auth user: ${TEST_AGENT.email}`);
            } else {
                throw error;
            }
        }

        // Step 2: Set Custom Claims
        await auth.setCustomUserClaims(user.uid, { roles: TEST_AGENT.roles });
        console.log(`✅ Set custom claims for ${TEST_AGENT.email}`);

        // Step 3: Create Firestore User Document
        await firestore.collection('users').doc(user.uid).set({
            id: user.uid,
            name: TEST_AGENT.name,
            email: TEST_AGENT.email,
            countryCode: TEST_AGENT.countryCode,
            contactNumber: TEST_AGENT.contactNumber,
            roles: TEST_AGENT.roles,
        }, { merge: true });
        console.log(`✅ Created Firestore user document`);

        // Step 4: Create Sample Itineraries assigned to this agent
        console.log('\n📋 Creating sample itineraries...');
        const itineraries = [
            {
                title: 'Dubai Luxury Experience',
                destination: 'Dubai, UAE',
                duration: 5,
                price: 15000,
                description: 'Experience the luxury and opulence of Dubai with world-class hotels, fine dining, and exclusive experiences.',
                imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070',
                assignedAgentIds: [user.uid],
                collaterals: [],
                dailyPlan: [
                    {
                        day: 1,
                        title: 'Arrival & Burj Khalifa',
                        activities: 'Arrive at Dubai International Airport. Transfer to luxury hotel. Evening visit to Burj Khalifa with dinner at At.mosphere restaurant. Overnight at 5-star hotel.'
                    },
                    {
                        day: 2,
                        title: 'Desert Safari & Cultural Experience',
                        activities: 'Morning at leisure. Afternoon desert safari with camel riding, sandboarding, and traditional BBQ dinner with belly dancing show. Return to hotel.'
                    },
                    {
                        day: 3,
                        title: 'Palm Jumeirah & Atlantis',
                        activities: 'Visit Palm Jumeirah and Atlantis The Palm. Enjoy Aquaventure Waterpark. Afternoon at private beach. Evening fine dining experience.'
                    },
                    {
                        day: 4,
                        title: 'Dubai Mall & Gold Souk',
                        activities: 'Shopping at Dubai Mall with over 1,200 stores. Visit Gold Souk for traditional jewelry. Evening Dhow cruise with dinner on Dubai Creek.'
                    },
                    {
                        day: 5,
                        title: 'Departure',
                        activities: 'Last minute shopping or spa treatment. Transfer to airport for departure flight.'
                    }
                ]
            },
            {
                title: 'Paris Romantic Getaway',
                destination: 'Paris, France',
                duration: 7,
                price: 25000,
                description: 'A romantic journey through the City of Light, featuring iconic landmarks, world-class museums, and intimate dining experiences.',
                imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073',
                assignedAgentIds: [user.uid],
                collaterals: [],
                dailyPlan: [
                    {
                        day: 1,
                        title: 'Arrival in Paris',
                        activities: 'Arrive at Charles de Gaulle Airport. Transfer to boutique hotel in Montmartre. Evening stroll through Sacré-Cœur and dinner at local bistro.'
                    },
                    {
                        day: 2,
                        title: 'Eiffel Tower & Seine Cruise',
                        activities: 'Morning visit to Eiffel Tower with skip-the-line access. Afternoon Seine River cruise. Evening dinner cruise with live music.'
                    },
                    {
                        day: 3,
                        title: 'Louvre Museum & Champs-Élysées',
                        activities: 'Full day at Louvre Museum with private guide. Afternoon shopping on Champs-Élysées. Evening at Moulin Rouge show.'
                    },
                    {
                        day: 4,
                        title: 'Versailles Day Trip',
                        activities: 'Day trip to Palace of Versailles with audio guide. Explore the gardens and Marie Antoinette\'s estate. Return to Paris for dinner.'
                    },
                    {
                        day: 5,
                        title: 'Notre-Dame & Latin Quarter',
                        activities: 'Visit Notre-Dame Cathedral (exterior). Explore Latin Quarter and Sorbonne University. Afternoon at Luxembourg Gardens.'
                    },
                    {
                        day: 6,
                        title: 'Montmartre & Art District',
                        activities: 'Morning at Montmartre with artist square. Visit Sacré-Cœur Basilica. Afternoon wine tasting. Evening farewell dinner.'
                    },
                    {
                        day: 7,
                        title: 'Departure',
                        activities: 'Last minute souvenir shopping. Transfer to airport for departure flight.'
                    }
                ]
            },
            {
                title: 'Bali Tropical Paradise',
                destination: 'Bali, Indonesia',
                duration: 10,
                price: 18000,
                description: 'Discover the beauty of Bali with pristine beaches, ancient temples, lush rice terraces, and world-renowned spa treatments.',
                imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=2070',
                assignedAgentIds: [user.uid],
                collaterals: [],
                dailyPlan: [
                    {
                        day: 1,
                        title: 'Arrival in Bali',
                        activities: 'Arrive at Ngurah Rai Airport. Transfer to beachfront resort in Seminyak. Welcome drink and orientation. Evening beach walk and dinner.'
                    },
                    {
                        day: 2,
                        title: 'Ubud Cultural Tour',
                        activities: 'Day trip to Ubud. Visit Tegalalang Rice Terraces, Ubud Monkey Forest, and traditional Balinese dance performance. Return to resort.'
                    },
                    {
                        day: 3,
                        title: 'Water Sports & Beach Day',
                        activities: 'Full day at beach resort. Enjoy water sports (snorkeling, jet skiing). Afternoon spa treatment. Evening sunset dinner.'
                    },
                    {
                        day: 4,
                        title: 'Temple Tour',
                        activities: 'Visit Tanah Lot Temple and Uluwatu Temple. Watch Kecak fire dance at sunset. Seafood dinner at Jimbaran Bay.'
                    },
                    {
                        day: 5,
                        title: 'Volcano & Hot Springs',
                        activities: 'Early morning Mount Batur sunrise trek (optional). Visit hot springs. Afternoon at leisure. Traditional Balinese cooking class.'
                    },
                    {
                        day: 6,
                        title: 'Nusa Penida Day Trip',
                        activities: 'Day trip to Nusa Penida island. Visit Kelingking Beach, Angel\'s Billabong, and Broken Beach. Return to main island.'
                    },
                    {
                        day: 7,
                        title: 'Spa & Wellness Day',
                        activities: 'Full day wellness experience. Traditional Balinese massage, yoga session, and healthy cuisine. Evening meditation.'
                    },
                    {
                        day: 8,
                        title: 'Art Villages & Shopping',
                        activities: 'Visit traditional art villages (wood carving, silver making, batik). Shopping for souvenirs. Evening cultural show.'
                    },
                    {
                        day: 9,
                        title: 'Free Day',
                        activities: 'Day at leisure. Optional activities: diving, surfing lessons, or private tour. Evening farewell dinner with traditional dance.'
                    },
                    {
                        day: 10,
                        title: 'Departure',
                        activities: 'Last minute shopping or spa treatment. Transfer to airport for departure flight.'
                    }
                ]
            }
        ];

        const itineraryRefs = [];
        for (const itinerary of itineraries) {
            const docRef = await firestore.collection('itineraries').add(itinerary);
            itineraryRefs.push({ id: docRef.id, ...itinerary });
            console.log(`  ✅ Created itinerary: ${itinerary.title}`);
        }

        // Step 5: Create Sample Customers registered by this agent
        console.log('\n👥 Creating sample customers...');
        const customers = [
            {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@example.com',
                dob: '1985-05-15',
                registrationDate: new Date().toISOString(),
                registeredByAgentId: user.uid,
                bookingStatus: 'Confirmed',
                documents: []
            },
            {
                firstName: 'Sarah',
                lastName: 'Johnson',
                email: 'sarah.johnson@example.com',
                dob: '1990-08-22',
                registrationDate: new Date().toISOString(),
                registeredByAgentId: user.uid,
                bookingStatus: 'Pending',
                documents: []
            },
            {
                firstName: 'Michael',
                lastName: 'Brown',
                email: 'michael.brown@example.com',
                dob: '1988-12-10',
                registrationDate: new Date().toISOString(),
                registeredByAgentId: user.uid,
                bookingStatus: 'Completed',
                documents: []
            }
        ];

        const customerRefs = [];
        for (const customer of customers) {
            const docRef = await firestore.collection('customers').add(customer);
            customerRefs.push({ id: docRef.id, ...customer });
            console.log(`  ✅ Created customer: ${customer.firstName} ${customer.lastName}`);
        }

        // Step 6: Create Sample Bookings
        console.log('\n📅 Creating sample bookings...');
        if (itineraryRefs.length > 0 && customerRefs.length > 0) {
            const bookings = [
                {
                    customerId: customerRefs[0].id,
                    itineraryId: itineraryRefs[0].id,
                    bookingDate: new Date().toISOString(),
                    status: 'Confirmed',
                    paymentStatus: 'Paid'
                },
                {
                    customerId: customerRefs[1].id,
                    itineraryId: itineraryRefs[1].id,
                    bookingDate: new Date().toISOString(),
                    status: 'Pending',
                    paymentStatus: 'Unpaid'
                },
                {
                    customerId: customerRefs[2].id,
                    itineraryId: itineraryRefs[2].id,
                    bookingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
                    status: 'Completed',
                    paymentStatus: 'Paid'
                }
            ];

            for (const booking of bookings) {
                await firestore.collection('bookings').add(booking);
                console.log(`  ✅ Created booking: ${booking.status} - ${booking.paymentStatus}`);
            }
        }

        console.log('\n✅ Test agent setup complete!');
        console.log('\n📋 Test Agent Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Email:    ${TEST_AGENT.email}`);
        console.log(`Password: ${TEST_AGENT.password}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🌐 Login URL: https://travelplan-grav.web.app/login');
        console.log('\n📊 Sample Data Created:');
        console.log(`  • ${itineraries.length} Itineraries (assigned to agent)`);
        console.log(`  • ${customers.length} Customers (registered by agent)`);
        console.log(`  • ${itineraryRefs.length > 0 && customerRefs.length > 0 ? 3 : 0} Bookings`);
        console.log('\n✨ Ready for walkthrough testing!');

    } catch (error) {
        console.error('❌ Error creating test agent:', error);
        process.exit(1);
    }
}

// Run the script
createTestAgent()
    .then(() => {
        console.log('\n🎉 Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });

