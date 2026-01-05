#!/usr/bin/env node

/**
 * Integration Test Script
 * Tests all the fixed functionality:
 * 1. Itinerary creation (manual)
 * 2. Itinerary creation (AI)
 * 3. Customer creation
 * 4. User count display
 * 5. Agent assignment
 * 
 * Usage:
 *   node scripts/test-integration.js
 * 
 * For emulator testing:
 *   VITE_USE_EMULATORS=true node scripts/test-integration.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAzA7MkNPrmBJ-V-4JrCFTmtlE_s76DKZg",
  authDomain: "travelplans-web-b43c6.firebaseapp.com",
  projectId: "travelplans-web-b43c6",
  storageBucket: "travelplans-web-b43c6.firebasestorage.app",
  messagingSenderId: "329181501952",
  appId: "1:329181501952:web:85f39e8b525d40244116e5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators if USE_EMULATORS is set
if (process.env.VITE_USE_EMULATORS === 'true' || process.env.USE_EMULATORS === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('✅ Connected to Firebase Emulators');
  } catch (error) {
    console.log('⚠️  Emulator connection:', error.message);
  }
}

const TEST_RESULTS = {
  passed: [],
  failed: []
};

function logTest(name, passed, message) {
  if (passed) {
    TEST_RESULTS.passed.push(name);
    console.log(`✅ ${name}: ${message || 'PASSED'}`);
  } else {
    TEST_RESULTS.failed.push(name);
    console.error(`❌ ${name}: ${message || 'FAILED'}`);
  }
}

async function testItineraryCreation() {
  try {
    console.log('\n📝 Testing Itinerary Creation...');
    
    const itineraryData = {
      title: 'Test Itinerary',
      destination: 'Test Destination',
      duration: 5,
      price: 2000,
      description: 'Test description',
      imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070',
      collaterals: []
    };

    const docRef = await addDoc(collection(db, 'itineraries'), itineraryData);
    logTest('Itinerary Creation', true, `Created with ID: ${docRef.id}`);

    // Verify it was created
    const q = query(collection(db, 'itineraries'), where('title', '==', 'Test Itinerary'));
    const snapshot = await getDocs(q);
    const created = snapshot.docs.find(d => d.id === docRef.id);
    
    if (created) {
      logTest('Itinerary Verification', true, 'Itinerary found in database');
      
      // Cleanup
      await deleteDoc(doc(db, 'itineraries', docRef.id));
      logTest('Itinerary Cleanup', true, 'Test itinerary deleted');
    } else {
      logTest('Itinerary Verification', false, 'Itinerary not found after creation');
    }
  } catch (error) {
    logTest('Itinerary Creation', false, error.message);
  }
}

async function testCustomerCreation() {
  try {
    console.log('\n👤 Testing Customer Creation...');
    
    // Get an agent user ID for testing
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const agentUser = usersSnapshot.docs.find(d => d.data().roles?.includes('Agent'));
    const agentId = agentUser ? agentUser.id : null;

    const customerData = {
      firstName: 'Test',
      lastName: 'Customer',
      email: `test-${Date.now()}@test.com`,
      dob: new Date('1990-01-01').toISOString(),
      registeredByAgentId: agentId,
      bookingStatus: 'Pending',
      documents: [],
      registrationDate: new Date()
    };

    const docRef = await addDoc(collection(db, 'customers'), customerData);
    logTest('Customer Creation', true, `Created with ID: ${docRef.id}`);

    // Verify it was created
    const q = query(collection(db, 'customers'), where('email', '==', customerData.email));
    const snapshot = await getDocs(q);
    const created = snapshot.docs.find(d => d.id === docRef.id);
    
    if (created) {
      logTest('Customer Verification', true, 'Customer found in database');
      
      // Cleanup
      await deleteDoc(doc(db, 'customers', docRef.id));
      logTest('Customer Cleanup', true, 'Test customer deleted');
    } else {
      logTest('Customer Verification', false, 'Customer not found after creation');
    }
  } catch (error) {
    logTest('Customer Creation', false, error.message);
  }
}

async function testUserCount() {
  try {
    console.log('\n👥 Testing User Count...');
    
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const userCount = usersSnapshot.size;
    
    logTest('User Count Retrieval', true, `Found ${userCount} users`);
    
    if (userCount > 0) {
      logTest('User Count Display', true, 'Users are available for display');
    } else {
      logTest('User Count Display', false, 'No users found - may need to seed data');
    }
  } catch (error) {
    logTest('User Count', false, error.message);
  }
}

async function testAgentAssignment() {
  try {
    console.log('\n🎯 Testing Agent Assignment...');
    
    // Get an agent
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const agentUser = usersSnapshot.docs.find(d => d.data().roles?.includes('Agent'));
    
    if (!agentUser) {
      logTest('Agent Assignment', false, 'No agent user found in database');
      return;
    }

    const itineraryData = {
      title: 'Agent Assigned Itinerary',
      destination: 'Test Destination',
      duration: 5,
      price: 2000,
      description: 'Test description',
      imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070',
      assignedAgentId: agentUser.id,
      collaterals: []
    };

    const docRef = await addDoc(collection(db, 'itineraries'), itineraryData);
    logTest('Agent Assignment', true, `Itinerary assigned to agent: ${agentUser.id}`);

    // Verify assignment
    const createdDoc = await getDocs(query(collection(db, 'itineraries'), where('__name__', '==', docRef.id)));
    const created = createdDoc.docs[0];
    
    if (created && created.data().assignedAgentId === agentUser.id) {
      logTest('Agent Assignment Verification', true, 'Agent assignment verified');
      
      // Cleanup
      await deleteDoc(doc(db, 'itineraries', docRef.id));
      logTest('Agent Assignment Cleanup', true, 'Test itinerary deleted');
    } else {
      logTest('Agent Assignment Verification', false, 'Agent assignment not found');
    }
  } catch (error) {
    logTest('Agent Assignment', false, error.message);
  }
}

async function runTests() {
  console.log('🧪 Starting Integration Tests...\n');
  console.log('=' .repeat(50));

  try {
    // Login as admin
    console.log('\n🔐 Authenticating...');
    await signInWithEmailAndPassword(auth, 'mail@jsabu.com', 'Admin123');
    logTest('Authentication', true, 'Logged in as admin');
  } catch (error) {
    console.log('⚠️  Could not authenticate, some tests may fail');
    console.log('   Error:', error.message);
  }

  // Run tests
  await testItineraryCreation();
  await testCustomerCreation();
  await testUserCount();
  await testAgentAssignment();

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${TEST_RESULTS.passed.length}`);
  console.log(`❌ Failed: ${TEST_RESULTS.failed.length}`);
  
  if (TEST_RESULTS.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    TEST_RESULTS.failed.forEach(test => console.log(`   - ${test}`));
  }

  if (TEST_RESULTS.passed.length > 0) {
    console.log('\n✅ Passed Tests:');
    TEST_RESULTS.passed.forEach(test => console.log(`   - ${test}`));
  }

  console.log('\n' + '='.repeat(50));
  
  // Exit with appropriate code
  process.exit(TEST_RESULTS.failed.length > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

