import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { Profesor } from "./types";

const requireDb = () => {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase db not available");
  return db;
};

export const listProfesores = async (): Promise<Profesor[]> => {
  const db = requireDb();
  const profesoresCollection = collection(db, "profesores");
  const snapshot = await getDocs(query(profesoresCollection, orderBy("createdAt", "desc")));
  return snapshot.docs.map((docItem) => {
    const data = docItem.data();
    return {
      id: docItem.id,
      nombre: String(data.nombre ?? ""),
      apellido: String(data.apellido ?? ""),
      activo: Boolean(data.activo ?? true),
      faceDescriptor: (data.faceDescriptor ?? null) as number[] | null,
      createdAt: data.createdAt?.toDate?.() ?? null,
    };
  });
};

export const createProfesor = async (nombre: string, apellido: string) => {
  const db = requireDb();
  const profesoresCollection = collection(db, "profesores");
  const ref = doc(profesoresCollection);
  await setDoc(ref, {
    nombre,
    apellido,
    activo: true,
    faceDescriptor: null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateProfesor = async (id: string, data: Partial<Profesor>) => {
  const db = requireDb();
  const profesoresCollection = collection(db, "profesores");
  await updateDoc(doc(profesoresCollection, id), {
    ...data,
  });
};

export const saveFaceDescriptor = async (id: string, descriptor: number[]) => {
  const db = requireDb();
  const profesoresCollection = collection(db, "profesores");
  await updateDoc(doc(profesoresCollection, id), {
    faceDescriptor: descriptor,
  });
};
