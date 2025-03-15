import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, name: string) => Promise<User>;
  logIn: (email: string, password: string) => Promise<User>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signUp: async () => {
    throw new Error('Not implemented');
  },
  logIn: async () => {
    throw new Error('Not implemented');
  },
  logOut: async () => {
    throw new Error('Not implemented');
  },
  resetPassword: async () => {
    throw new Error('Not implemented');
  },
  error: null,
  setError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<Omit<AuthContextType, 'signUp' | 'logIn' | 'logOut' | 'resetPassword' | 'setError'>>({
    user: null,
    loading: true,
    isAdmin: false,
    error: null,
  });
  
  const setError = (error: string | null) => {
    setAuthState(prev => ({ ...prev, error }));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            // User exists in Firestore, use that data
            const userData = userDoc.data() as User;
            setAuthState({
              user: userData,
              loading: false,
              isAdmin: userData.role === 'admin',
              error: null,
            });
          } else {
            // User exists in Auth but not in Firestore (edge case)
            // Set as a basic user record
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'User',
              role: 'user',
              bikes: [],
              jobs: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            // Serialize dates for Firestore
            const userForFirestore = {
              ...newUser,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            
            await setDoc(userDocRef, userForFirestore);
            
            setAuthState({
              user: newUser,
              loading: false,
              isAdmin: false,
              error: null,
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setAuthState({
            user: null,
            loading: false,
            isAdmin: false,
            error: 'Failed to load user data',
          });
        }
      } else {
        setAuthState({ user: null, loading: false, isAdmin: false, error: null });
      }
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, name: string): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;
      
      const newUser: User = {
        id: uid,
        email,
        name,
        role: 'user',
        bikes: [],
        jobs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Create a Firestore-friendly version (avoiding Date objects)
      const userForFirestore = {
        id: uid,
        email,
        name,
        role: 'user',
        bikes: [],
        jobs: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      // Save user to Firestore
      await setDoc(doc(db, 'users', uid), userForFirestore);
      
      setAuthState(prev => ({
        ...prev,
        user: newUser,
        loading: false,
        isAdmin: false,
        error: null,
      }));
      
      return newUser;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign up';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };
  
  const logIn = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;
      
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setAuthState({
          user: userData,
          loading: false,
          isAdmin: userData.role === 'admin',
          error: null,
        });
        return userData;
      } else {
        throw new Error('User data not found');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to log in';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };
  
  const logOut = async (): Promise<void> => {
    try {
      await signOut(auth);
      setAuthState({
        user: null,
        loading: false,
        isAdmin: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to log out';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };
  
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send password reset email';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        ...authState, 
        signUp, 
        logIn, 
        logOut, 
        resetPassword,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 