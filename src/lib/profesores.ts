import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
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
      jornada: (data.jornada ?? "mañana") as "mañana" | "tarde",
      horaInicio: String(data.horaInicio ?? "06:15"),
      horaFin: String(data.horaFin ?? "14:15"),
      createdAt: data.createdAt?.toDate?.() ?? null,
    };
  });
};

export const subscribeProfesoresActivos = (
  onChange: (items: Profesor[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const db = requireDb();
  const profesoresCollection = collection(db, "profesores");
  const profesoresQuery = query(profesoresCollection, where("activo", "==", true));
  return onSnapshot(
    profesoresQuery,
    (snapshot) => {
      const items = snapshot.docs.map((docItem) => {
        const data = docItem.data();
        return {
          id: docItem.id,
          nombre: String(data.nombre ?? ""),
          apellido: String(data.apellido ?? ""),
          activo: Boolean(data.activo ?? true),
          faceDescriptor: (data.faceDescriptor ?? null) as number[] | null,
          jornada: (data.jornada ?? "mañana") as "mañana" | "tarde",
          horaInicio: String(data.horaInicio ?? "06:15"),
          horaFin: String(data.horaFin ?? "14:15"),
          createdAt: data.createdAt?.toDate?.() ?? null,
        };
      });
      onChange(items);
    },
    (error) => {
      onError?.(error instanceof Error ? error : new Error("Snapshot error"));
    }
  );
};

export const subscribeProfesores = (onChange: (items: Profesor[]) => void): Unsubscribe => {
  const db = requireDb();
  const profesoresCollection = collection(db, "profesores");
  const profesoresQuery = query(profesoresCollection, orderBy("createdAt", "desc"));
  return onSnapshot(profesoresQuery, (snapshot) => {
    const items = snapshot.docs.map((docItem) => {
      const data = docItem.data();
      return {
        id: docItem.id,
        nombre: String(data.nombre ?? ""),
        apellido: String(data.apellido ?? ""),
        activo: Boolean(data.activo ?? true),
        faceDescriptor: (data.faceDescriptor ?? null) as number[] | null,
        jornada: (data.jornada ?? "mañana") as "mañana" | "tarde",
        horaInicio: String(data.horaInicio ?? "06:15"),
        horaFin: String(data.horaFin ?? "14:15"),
        createdAt: data.createdAt?.toDate?.() ?? null,
      };
    });
    onChange(items);
  });
};

export const createProfesor = async (
  nombre: string,
  apellido: string,
  jornada: "mañana" | "tarde",
  horaInicio: string,
  horaFin: string
) => {
  const db = requireDb();
  const profesoresCollection = collection(db, "profesores");
  const ref = doc(profesoresCollection);
  await setDoc(ref, {
    nombre,
    apellido,
    activo: true,
    faceDescriptor: null,
    jornada,
    horaInicio,
    horaFin,
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
