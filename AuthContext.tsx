// AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { auth } from './firebaseconfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';

// Definim un tip pentru ceea ce vrem să expunem prin context
interface AuthContextProps {
  user: FirebaseUser | null;       // utilizatorul curent (sau null, dacă nu e logat)
  loading: boolean;               // pentru a marca încărcarea inițială
  signUp: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Cream contextul propriu-zis cu valori default
const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  signUp: async () => {},
  login: async () => {},
  logout: async () => {},
});

// Providerul pe care îl vom folosi în App.tsx
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Ascultăm evenimentele de schimbare a stării de autentificare
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // La demontarea componentului, ne dezabonăm
    return () => unsubscribe();
  }, []);

  // Metoda de signUp (cu email/parolă)
  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  // Metoda de login (cu email/parolă)
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Metoda de logout
  const logout = async () => {
    await signOut(auth);
  };

  // Structura de date expusă prin context
  const value: AuthContextProps = {
    user,
    loading,
    signUp,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook custom pentru a accesa mai ușor contextul
export const useAuth = () => useContext(AuthContext);