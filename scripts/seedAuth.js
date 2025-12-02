// This script requires Firebase Admin SDK
// Run with: node scripts/seedAuth.js
// Note: Requires GOOGLE_APPLICATION_CREDENTIALS environment variable or service account key

const admin = require('firebase-admin');

// Initialize Firebase Admin (requires service account)
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

// Initial users to create
const usersToSeed = [
    {
        email: 'mail@jsabu.com',
        password: 'Admin123',
        displayName: 'Admin User',
        emailVerified: true,
        customClaims: { roles: ['Admin'] },
        firestoreData: {
            name: 'Admin User',
            email: 'mail@jsabu.com',
            roles: ['Admin'],
        },
    },
    {
        email: 'agent@travelplans.fun',
        password: 'Agent@123',
        displayName: 'Travel Agent',
        emailVerified: true,
        customClaims: { roles: ['Agent'] },
        firestoreData: {
            name: 'Travel Agent',
            email: 'agent@travelplans.fun',
            roles: ['Agent'],
        },
    },
    {
        email: 'customer@travelplans.fun',
        password: 'Customer@123',
        displayName: 'Customer User',
        emailVerified: true,
        customClaims: { roles: ['Customer'] },
        firestoreData: {
            name: 'Customer User',
            email: 'customer@travelplans.fun',
            roles: ['Customer'],
        },
    },
    {
        email: 'rm@travelplans.fun',
        password: 'RM@123',
        displayName: 'Relationship Manager',
        emailVerified: true,
        customClaims: { roles: ['Relationship Manager'] },
        firestoreData: {
            name: 'Relationship Manager',
            email: 'rm@travelplans.fun',
            roles: ['Relationship Manager'],
        },
    },
];

async function seedAuth() {
    try {
        console.log('Starting authentication seeding...');

        for (const userData of usersToSeed) {
            try {
                // Check if user already exists
                let user;
                try {
                    user = await auth.getUserByEmail(userData.email);
                    console.log(`User ${userData.email} already exists, skipping...`);
                } catch (error) {
                    if (error.code === 'auth/user-not-found') {
                        // Create new user
                        user = await auth.createUser({
                            email: userData.email,
                            password: userData.password,
                            displayName: userData.displayName,
                            emailVerified: userData.emailVerified,
                        });
                        console.log(`Created user: ${userData.email}`);
                    } else {
                        throw error;
                    }
                }

                // Set custom claims
                if (userData.customClaims) {
                    await auth.setCustomUserClaims(user.uid, userData.customClaims);
                    console.log(`Set custom claims for ${userData.email}`);
                }

                // Create/update Firestore user document
                const userRef = firestore.collection('users').doc(user.uid);
                await userRef.set({
                    ...userData.firestoreData,
                    id: user.uid,
                }, { merge: true });
                console.log(`Created/updated Firestore document for ${userData.email}`);

            } catch (error) {
                console.error(`Error processing user ${userData.email}:`, error);
            }
        }

        console.log('Authentication seeding completed!');
        console.log('\nDefault credentials:');
        usersToSeed.forEach(u => {
            console.log(`  Email: ${u.email}, Password: ${u.password}`);
        });
    } catch (error) {
        console.error('Error seeding authentication:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    seedAuth()
        .then(() => {
            console.log('Seeding complete');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { seedAuth };
