// Client-side script to create users in Firebase Auth
// Run this in browser console or as a Node script with Firebase client SDK
// Note: This requires Firebase Auth to allow email/password signup

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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
const auth = getAuth(app);
const db = getFirestore(app);

// Users to create
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
    console.log('Starting user creation...');
    console.log('Note: Make sure Email/Password authentication is enabled in Firebase Console');
    console.log('Note: This script will create users one by one and sign out after each creation\n');

    for (const userData of usersToCreate) {
        try {
            console.log(`Creating user: ${userData.email}...`);
            
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                userData.email,
                userData.password
            );
            
            const user = userCredential.user;
            console.log(`✅ User created in Auth: ${user.uid}`);

            // Create user document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                id: user.uid,
                name: userData.name,
                email: userData.email,
                roles: userData.roles,
            });
            
            console.log(`✅ Firestore document created for ${userData.email}`);
            console.log(`   Roles: ${userData.roles.join(', ')}\n`);

            // Sign out to allow creating next user
            await auth.signOut();

        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                console.log(`⚠️  User ${userData.email} already exists, skipping...\n`);
            } else {
                console.error(`❌ Error creating user ${userData.email}:`, error.message);
                console.log('');
            }
        }
    }

    console.log('User creation completed!');
    console.log('\nCreated users:');
    usersToCreate.forEach(u => {
        console.log(`  Email: ${u.email}, Password: ${u.password}, Roles: ${u.roles.join(', ')}`);
    });
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    createUsers()
        .then(() => {
            console.log('\n✅ All users created successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Error:', error);
            process.exit(1);
        });
}

export { createUsers };





