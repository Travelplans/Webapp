import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration - defaults to production, can be overridden by environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD0HAe0Q7ZNDIoAME0-iP-1Xwa_SzmgSvU",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "travelplan-grav.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "travelplan-grav",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "travelplan-grav.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "848531208932",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:848531208932:web:28bbab98766f81a553caf1",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-67MT6WJXQW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Storage for document uploads
export const storage = getStorage(app);

// Connect to emulators in development mode if not explicitly disabled
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS !== 'false') {
  try {
    // Only connect if not already connected
    if (!(auth as any)._delegate?._config?.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    }
    if (!(db as any)._delegate?._settings?.host?.includes('localhost')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    if (!(storage as any)._delegate?._host?.includes('localhost')) {
      connectStorageEmulator(storage, 'localhost', 9199);
    }
    console.log('✅ Connected to Firebase Emulators');
  } catch (error) {
    // Emulators might already be connected or not running
    console.log('ℹ️ Emulator connection:', error instanceof Error ? error.message : 'Already connected or emulators not running');
  }
}

// Initialize Analytics (conditionally)
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export default app;
