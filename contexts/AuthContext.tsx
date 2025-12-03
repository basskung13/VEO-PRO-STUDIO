
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../firebaseConfig';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AppUser } from '../types';

interface AuthContextType {
  currentUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isDemoMode = !auth;

  useEffect(() => {
    if (isDemoMode) {
        // Handle LocalStorage Auth for Demo Mode
        const localUser = localStorage.getItem('veo_logged_in_user');
        if (localUser) {
            const parsed = JSON.parse(localUser);
            // Mock Objects
            setCurrentUser({ email: parsed.username, uid: 'local-user' } as User);
            setAppUser({
                uid: 'local-user',
                email: parsed.username,
                role: 'admin', // Default to admin for demo
                subscriptionStatus: 'active'
            });
        }
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch User Data from Firestore
        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                setAppUser(userSnap.data() as AppUser);
            } else {
                // Initialize new user in Firestore
                const newAppUser: AppUser = {
                    uid: user.uid,
                    email: user.email || '',
                    role: 'user', // Default role
                    subscriptionStatus: 'pending', // Default requires payment
                    isBanned: false
                };
                await setDoc(userRef, newAppUser);
                setAppUser(newAppUser);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isDemoMode]);

  const login = async (email: string, pass: string) => {
    if (isDemoMode) {
        const user = { username: email, uid: 'local', role: 'user' };
        localStorage.setItem('veo_logged_in_user', JSON.stringify(user));
        window.location.reload(); 
        return;
    }
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string) => {
     if (isDemoMode) {
        const user = { username: email, uid: 'local', role: 'user' };
        localStorage.setItem('veo_logged_in_user', JSON.stringify(user));
        window.location.reload(); 
        return;
    }
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const loginWithGoogle = async () => {
    if (isDemoMode) { alert("Google Login requires Firebase Config."); return; }
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    if (isDemoMode) {
        localStorage.removeItem('veo_logged_in_user');
        window.location.reload();
        return;
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ currentUser, appUser, loading, login, signup, loginWithGoogle, logout, isDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};
