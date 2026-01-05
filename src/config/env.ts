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
      if (import.meta.env.PROD) {
        // eslint-disable-next-line no-console
        console.warn(`Using default value for ${key} in production. Set ${key} environment variable.`);
      }
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
      import.meta.env.DEV ? 'AIzaSyAzA7MkNPrmBJ-V-4JrCFTmtlE_s76DKZg' : undefined
    ),
    authDomain: getEnvVar(
      'VITE_FIREBASE_AUTH_DOMAIN',
      import.meta.env.DEV ? 'travelplans-web-b43c6.firebaseapp.com' : undefined
    ),
    projectId: getEnvVar(
      'VITE_FIREBASE_PROJECT_ID',
      import.meta.env.DEV ? 'travelplans-web-b43c6' : undefined
    ),
    storageBucket: getEnvVar(
      'VITE_FIREBASE_STORAGE_BUCKET',
      import.meta.env.DEV ? 'travelplans-web-b43c6.firebasestorage.app' : undefined
    ),
    messagingSenderId: getEnvVar(
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      import.meta.env.DEV ? '329181501952' : undefined
    ),
    appId: getEnvVar(
      'VITE_FIREBASE_APP_ID',
      import.meta.env.DEV ? '1:329181501952:web:85f39e8b525d40244116e5' : undefined
    ),
    measurementId: getEnvVar(
      'VITE_FIREBASE_MEASUREMENT_ID',
      import.meta.env.DEV ? 'G-GVR2ZDNFYW' : undefined
    ),
  },
};

