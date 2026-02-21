import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  getAuth,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { getFirebaseAuth, getFirebaseDb } from "./firebase";
import type { AdminProfile } from "./types";

const requireAuth = () => {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase auth not available");
  return auth;
};

const requireDb = () => {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase db not available");
  return db;
};

export const watchAuthState = (onChange: (user: User | null) => void) =>
  onAuthStateChanged(requireAuth(), onChange);

export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(requireAuth(), email, password);

export const logout = () => signOut(requireAuth());

export const getAdminProfile = async (uid: string): Promise<AdminProfile | null> => {
  const db = requireDb();
  const adminsCollection = collection(db, "admins");
  const snapshot = await getDoc(doc(adminsCollection, uid));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    uid,
    email: String(data.email ?? ""),
    role: (data.role ?? "admin") as AdminProfile["role"],
    createdAt: data.createdAt?.toDate?.() ?? null,
  };
};

export const createAdminUser = async (email: string, password: string) => {
  const auth = requireAuth();
  const db = requireDb();
  const adminsCollection = collection(db, "admins");
  const secondaryApp =
    getApps().length > 1
      ? getApps().find((app) => app.name === "secondary") ??
        initializeApp(auth.app.options, "secondary")
      : initializeApp(auth.app.options, "secondary");

  const secondaryAuth = getAuth(secondaryApp);
  const created = await createUserWithEmailAndPassword(
    secondaryAuth,
    email,
    password
  );

  const profileRef = doc(adminsCollection, created.user.uid);
  await setDoc(profileRef, {
    uid: created.user.uid,
    email,
    role: "admin",
    createdAt: serverTimestamp(),
  });

  await signOut(secondaryAuth);
  return created.user.uid;
};
