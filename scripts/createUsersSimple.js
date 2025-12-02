// Simple Node.js script to create users
// Note: This requires Firebase Admin SDK setup
// Alternative: Use createUsers.html in browser (easier)

import admin from 'firebase-admin';

// Initialize Firebase Admin
// You need to either:
// 1. Set GOOGLE_APPLICATION_CREDENTIALS environment variable, OR
// 2. Provide service account key below

try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    }
} catch (error) {
    console.error('❌ Firebase Admin initialization failed!');
    console.error('Please set up Firebase Admin credentials.');
    console.error('\nAlternative: Open scripts/createUsers.html in your browser instead.');
    console.error('\nOr set GOOGLE_APPLICATION_CREDENTIALS environment variable:');
    console.error('export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"');
    process.exit(1);
}

const auth = admin.auth();
const firestore = admin.firestore();

const usersToCreate = [
    {
        email: 'mail@jsabu.com',
        password: 'Admin123',
        name: 'Admin User',
        roles: ['Admin'],
    },
    {
        email: 'agent@travelplans.fun',
        password: 'Agent@123',
        name: 'Travel Agent',
        roles: ['Agent'],
    },
    {
        email: 'customer@travelplans.fun',
        password: 'Customer@123',
        name: 'Customer User',
        roles: ['Customer'],
    },
    {
        email: 'rm@travelplans.fun',
        password: 'RM@123',
        name: 'Relationship Manager',
        roles: ['Relationship Manager'],
    },
];

async function createUsers() {
    console.log('🚀 Starting user creation...\n');

    for (const userData of usersToCreate) {
        try {
            console.log(`Creating user: ${userData.email}...`);
            
            let user;
            try {
                user = await auth.getUserByEmail(userData.email);
                console.log(`⚠️  User ${userData.email} already exists, updating...`);
            } catch (error) {
                if (error.code === 'auth/user-not-found') {
                    user = await auth.createUser({
                        email: userData.email,
                        password: userData.password,
                        displayName: userData.name,
                        emailVerified: true,
                    });
                    console.log(`✅ User created in Auth: ${user.uid}`);
                } else {
                    throw error;
                }
            }

            // Set custom claims
            await auth.setCustomUserClaims(user.uid, { roles: userData.roles });
            console.log(`✅ Custom claims set: ${userData.roles.join(', ')}`);

            // Create/update Firestore document
            await firestore.collection('users').doc(user.uid).set({
                id: user.uid,
                name: userData.name,
                email: userData.email,
                roles: userData.roles,
            }, { merge: true });
            
            console.log(`✅ Firestore document created/updated\n`);

        } catch (error) {
            console.error(`❌ Error creating user ${userData.email}:`, error.message);
            console.log('');
        }
    }

    console.log('✅ User creation completed!\n');
    console.log('Created users:');
    usersToCreate.forEach(u => {
        console.log(`  📧 ${u.email} | 🔑 ${u.password} | 👤 ${u.roles.join(', ')}`);
    });
}

createUsers()
    .then(() => {
        console.log('\n🎉 All done! You can now log in to the application.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error:', error);
        process.exit(1);
    });

