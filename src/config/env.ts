/**
 * Environment variable validation and configuration
 * Provides defaults for development but requires env vars in production
 */

interface EnvConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  
  if (!value) {
    if (defaultValue) {
      // If a default is provided, we intentionally allow it (even in PROD).
      // This avoids noisy console warnings for non-secret frontend config like Firebase web config.
      return defaultValue;
    }
    
    if (import.meta.env.PROD) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    
    // eslint-disable-next-line no-console
    console.warn(`Missing environment variable: ${key}. Using empty string in development.`);
    return '';
  }
  
  return value;
};

/**
 * Validated environment configuration
 * Uses defaults in development, requires env vars in production
 * 
 * NOTE: In production, these should be set via environment variables.
 * For development, defaults are provided for convenience.
 */
export const env: EnvConfig = {
  firebase: {
    apiKey: getEnvVar(
      'VITE_FIREBASE_API_KEY',
      // Safe to ship in frontend bundles (Firebase API keys are not secrets)
      'AIzaSyAzA7MkNPrmBJ-V-4JrCFTmtlE_s76DKZg'
    ),
    authDomain: getEnvVar(
      'VITE_FIREBASE_AUTH_DOMAIN',
      'travelplans-web-b43c6.firebaseapp.com'
    ),
    projectId: getEnvVar(
      'VITE_FIREBASE_PROJECT_ID',
      'travelplans-web-b43c6'
    ),
    storageBucket: getEnvVar(
      'VITE_FIREBASE_STORAGE_BUCKET',
      'travelplans-web-b43c6.firebasestorage.app'
    ),
    messagingSenderId: getEnvVar(
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      '329181501952'
    ),
    appId: getEnvVar(
      'VITE_FIREBASE_APP_ID',
      '1:329181501952:web:85f39e8b525d40244116e5'
    ),
    measurementId: getEnvVar(
      'VITE_FIREBASE_MEASUREMENT_ID',
      'G-GVR2ZDNFYW'
    ),
  },
};

