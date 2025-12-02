import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Fetch additional user details (roles) from Firestore
          // We assume the Firestore user ID matches the Auth UID or email is used for lookup
          // For this implementation, let's assume we store users in Firestore with their Auth UID
          // OR, since we are migrating from mock data where IDs are like 'user-admin-1', 
          // we might need a mapping strategy. 
          // For a clean production setup, we should ideally use Auth UID as document ID.
          // However, to support the existing mock data structure during transition:
          // We will try to find a user in Firestore by email.

          // NOTE: In a real production app, you should use `doc(db, 'users', firebaseUser.uid)`
          // But since we are seeding data with custom IDs, we'll need to query by email or update the seeding to use UIDs.
          // For now, let's try to fetch by email if direct ID lookup fails, or just rely on the seeding script 
          // to eventually be updated to use real Auth UIDs.

          // Let's assume for now that the user document might not exist yet if it's a fresh signup,
          // but here we are only handling login.

          // Strategy: Query 'users' collection where email == firebaseUser.email
          // This requires an index, but for small datasets it works.
          // Actually, let's just use the `getUserById` equivalent logic but searching.

          // Since we can't easily query without importing the service, let's do a direct Firestore fetch here.
          // We will assume the user document ID matches the Auth UID for new users, 
          // but for the seeded users, we might have a disconnect.
          // To make this work with the SEEDED data, we need to manually link them or just use the email to find the role.

          // SIMPLIFICATION FOR MIGRATION:
          // We will fetch ALL users and find the one with the matching email. 
          // This is not efficient for large DBs but fine for this migration step.

          const { collection, getDocs, query, where } = await import('firebase/firestore');
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', firebaseUser.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            setUser({ id: userDoc.id, ...userDoc.data() } as User);
          } else {
            // Fallback if user not found in Firestore (shouldn't happen if data is seeded correctly)
            console.warn('User authenticated but not found in Firestore DB');
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              roles: [], // No roles assigned yet
            });
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};