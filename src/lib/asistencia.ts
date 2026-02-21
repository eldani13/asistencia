import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { Asistencia, Profesor } from "./types";

const requireDb = () => {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase db not available");
  return db;
};

export const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

export const getProfesorById = async (id: string): Promise<Profesor | null> => {
  const db = requireDb();
  const profesoresCollection = collection(db, "profesores");
  const snapshot = await getDoc(doc(profesoresCollection, id));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    id: snapshot.id,
    nombre: String(data.nombre ?? ""),
    apellido: String(data.apellido ?? ""),
    activo: Boolean(data.activo ?? true),
    faceDescriptor: (data.faceDescriptor ?? null) as number[] | null,
    createdAt: data.createdAt?.toDate?.() ?? null,
  };
};

export const listProfesoresActivos = async (): Promise<Profesor[]> => {
  const db = requireDb();
  const profesoresCollection = collection(db, "profesores");
  const snapshot = await getDocs(query(profesoresCollection, where("activo", "==", true)));
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

export const listAsistenciasByDate = async (fecha: string): Promise<Asistencia[]> => {
  const db = requireDb();
  const asistenciasCollection = collection(db, "asistencias");
  const snapshot = await getDocs(query(asistenciasCollection, where("fecha", "==", fecha)));
  return snapshot.docs.map((docItem) => {
    const data = docItem.data();
    return {
      id: docItem.id,
      profesorId: String(data.profesorId ?? ""),
      fecha: String(data.fecha ?? ""),
      horaEntrada: data.horaEntrada ? String(data.horaEntrada) : null,
      horaSalida: data.horaSalida ? String(data.horaSalida) : null,
      createdAt: data.createdAt?.toDate?.() ?? null,
    };
  });
};

export const registerAsistencia = async (profesorId: string) => {
  const now = new Date();
  const fecha = formatDateKey(now);
  const hora = formatTime(now);
  const docId = `${profesorId}_${fecha}`;

  const db = requireDb();
  const asistenciasCollection = collection(db, "asistencias");

  return runTransaction(db, async (transaction) => {
    const ref = doc(asistenciasCollection, docId);
    const snapshot = await transaction.get(ref);

    if (!snapshot.exists()) {
      transaction.set(ref, {
        profesorId,
        fecha,
        horaEntrada: hora,
        horaSalida: null,
        createdAt: serverTimestamp(),
      });
      return { status: "entrada" as const };
    }

    const data = snapshot.data();

    if (data.horaEntrada && data.horaSalida) {
      return { status: "error" as const, message: "Ya existe entrada y salida hoy." };
    }

    if (data.horaEntrada && !data.horaSalida) {
      transaction.update(ref, {
        horaSalida: hora,
      });
      return { status: "salida" as const };
    }

    if (!data.horaEntrada) {
      transaction.update(ref, {
        horaEntrada: hora,
      });
      return { status: "entrada" as const };
    }

    return { status: "error" as const, message: "Estado invalido." };
  });
};

export const updateAsistenciaTimes = async (
  id: string,
  horaEntrada: string | null,
  horaSalida: string | null
) => {
  const db = requireDb();
  const asistenciasCollection = collection(db, "asistencias");
  await updateDoc(doc(asistenciasCollection, id), {
    horaEntrada: horaEntrada || null,
    horaSalida: horaSalida || null,
  });
};
