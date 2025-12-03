
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration from your Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCCTCZu6CwMIgo7UZv0fIpQGQ-Lu6r0RQE",
  authDomain: "veo-studio-95f4b.firebaseapp.com",
  projectId: "veo-studio-95f4b",
  storageBucket: "veo-studio-95f4b.firebasestorage.app",
  messagingSenderId: "284680079648",
  appId: "1:284680079648:web:e5abf15d170e818db9ef45",
  measurementId: "G-8S6X9E681W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
