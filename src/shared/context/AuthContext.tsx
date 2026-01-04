import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { auth, db } from '../../config/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mark that we're initializing auth
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Fetch additional user details (roles) from Firestore
          // Use Auth UID directly as document ID (efficient approach)
          const { doc, getDoc, setDoc } = await import('firebase/firestore');
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUser({ id: userDocSnap.id, ...userDocSnap.data() } as User);
          } else {
            // User document doesn't exist - create it with basic info
            // This can happen for newly created users
            const newUserData: Omit<User, 'id'> = {
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              roles: [],
            };
            
            await setDoc(userDocRef, newUserData);
            setUser({
              id: firebaseUser.uid,
              ...newUserData,
            });
          }
        } catch (error) {
          const { logger } = await import('../utils/logger');
          logger.error('Error fetching user details', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      // Always set loading to false after auth state is determined
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const { logger } = await import('../utils/logger');
      logger.error('Login error', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      const { logger } = await import('../utils/logger');
      logger.error('Logout error', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Configure action code settings for password reset
      const actionCodeSettings = {
        url: window.location.origin + '/login',
        handleCodeInApp: false,
      };
      
      console.log('[resetPassword] Sending password reset email to:', email);
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      console.log('[resetPassword] Password reset email sent successfully');
    } catch (error: any) {
      console.error('[resetPassword] Error details:', {
        code: error.code,
        message: error.message,
        email: email
      });
      
      const { logger } = await import('../utils/logger');
      logger.error('Password reset error', error);
      
      // Provide user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please try again later.');
      } else {
        throw new Error(error.message || 'Failed to send password reset email. Please try again.');
      }
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};