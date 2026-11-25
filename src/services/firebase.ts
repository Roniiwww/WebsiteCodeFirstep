import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';

// Default GiveBack Firebase configuration
// Can be customized via Vite environment variables (.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyGiveBackCommunityKey-DemoMode",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "giveback-community.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "giveback-community",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "giveback-community.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "84291849201",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:84291849201:web:givebackwebid98124"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let isFirebaseInitialized = false;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  isFirebaseInitialized = true;
  console.log('[Firebase] Initialized GiveBack Firebase Services successfully.');
} catch (error) {
  console.warn('[Firebase] Running in local resilient mode (Firebase SDK initialized with fallback):', error);
}

export { app, auth, db, isFirebaseInitialized };

/**
 * Save / Sync a user profile to Firebase Firestore (users collection)
 */
export async function syncUserToFirestore(userData: {
  id: string;
  name: string;
  email: string;
  role?: string;
  organizationName?: string;
  location?: string;
  phone?: string;
  skills?: string[];
  avatar?: string;
  createdAt?: string;
}) {
  if (!db) return false;
  try {
    const userDocRef = doc(db, 'users', userData.id);
    await setDoc(userDocRef, {
      ...userData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('[Firebase] Firestore user sync fallback to local storage:', err);
    return false;
  }
}

/**
 * Sync a volunteer opportunity or help request to Firestore
 */
export async function syncOpportunityToFirestore(opportunityData: any) {
  if (!db) return false;
  try {
    const oppRef = doc(db, 'opportunities', opportunityData.id);
    await setDoc(oppRef, {
      ...opportunityData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('[Firebase] Firestore opportunity sync fallback to local storage:', err);
    return false;
  }
}
