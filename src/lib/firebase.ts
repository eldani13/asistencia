import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isBrowser = typeof window !== "undefined";

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;
let cachedStorage: FirebaseStorage | null = null;

export const getFirebaseApp = () => {
  if (!isBrowser) return null;
  if (!cachedApp) {
    cachedApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return cachedApp;
};

export const getFirebaseAuth = () => {
  if (!isBrowser) return null;
  if (!cachedAuth) {
    const app = getFirebaseApp();
    if (!app) return null;
    cachedAuth = getAuth(app);
  }
  return cachedAuth;
};

export const getFirebaseDb = () => {
  if (!isBrowser) return null;
  if (!cachedDb) {
    const app = getFirebaseApp();
    if (!app) return null;
    cachedDb = getFirestore(app);
  }
  return cachedDb;
};

export const getFirebaseStorage = () => {
  if (!isBrowser) return null;
  if (!cachedStorage) {
    const app = getFirebaseApp();
    if (!app) return null;
    cachedStorage = getStorage(app);
  }
  return cachedStorage;
};
