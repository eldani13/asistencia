import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { Asistencia } from "@/types/asistencia/asistencia";
import type { Profesor } from "@/types/profesor/profesor";

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

const parseTimeToMinutes = (value: string | null) => {
  if (!value) return null;
  const [hoursPart, minutesPart] = value.split(":");
  const hours = Number(hoursPart);
  const minutes = Number(minutesPart ?? "0");
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const computeWorkedMinutes = (horaEntrada: string | null, horaSalida: string | null) => {
  const entrada = parseTimeToMinutes(horaEntrada);
  const salida = parseTimeToMinutes(horaSalida);
  if (entrada === null || salida === null) return null;
  const diff = salida - entrada;
  return diff >= 0 ? diff : null;
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
    faceDescriptor: (data.faceDescriptor ?? undefined) as number[] | undefined,
    jornada: (data.jornada ?? "mañana") as "mañana" | "tarde",
    horaInicio: String(data.horaInicio ?? "06:15"),
    horaFin: String(data.horaFin ?? "14:15"),
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
      faceDescriptor: data.faceDescriptor ?? undefined,
      jornada: (data.jornada ?? "mañana") as "mañana" | "tarde",
      horaInicio: String(data.horaInicio ?? "06:15"),
      horaFin: String(data.horaFin ?? "14:15"),
    };
  });
};

export const listAsistenciasByDate = async (fecha: string): Promise<Asistencia[]> => {
  const db = requireDb();
  const asistenciasCollection = collection(db, "asistencias");
  const snapshot = await getDocs(query(asistenciasCollection, where("fecha", "==", fecha)));
  return snapshot.docs.map((docItem) => {
    const data = docItem.data();
    const minutosTrabajados = computeWorkedMinutes(
      data.horaEntrada ? String(data.horaEntrada) : null,
      data.horaSalida ? String(data.horaSalida) : null
    );
    return {
      id: docItem.id,
      profesorId: String(data.profesorId ?? ""),
      fecha: String(data.fecha ?? ""),
      horaEntrada: data.horaEntrada ? String(data.horaEntrada) : undefined,
      horaSalida: data.horaSalida ? String(data.horaSalida) : undefined,
      jornada: data.jornada ? String(data.jornada) : undefined,
      minutosTrabajados: minutosTrabajados ?? undefined,
      horasTrabajadas:
        minutosTrabajados !== null ? Math.round((minutosTrabajados / 60) * 100) / 100 : undefined,
    };
  });
};

export const subscribeAsistenciasByDate = (
  fecha: string,
  onChange: (items: Asistencia[]) => void
): Unsubscribe => {
  const db = requireDb();
  const asistenciasCollection = collection(db, "asistencias");
  const asistenciasQuery = query(asistenciasCollection, where("fecha", "==", fecha));
  return onSnapshot(asistenciasQuery, (snapshot) => {
    const items = snapshot.docs.map((docItem) => {
      const data = docItem.data();
      const minutosTrabajados = computeWorkedMinutes(
        data.horaEntrada ? String(data.horaEntrada) : null,
        data.horaSalida ? String(data.horaSalida) : null
      );
      return {
        id: docItem.id,
        profesorId: String(data.profesorId ?? ""),
        fecha: String(data.fecha ?? ""),
        horaEntrada: data.horaEntrada ? String(data.horaEntrada) : undefined,
        horaSalida: data.horaSalida ? String(data.horaSalida) : undefined,
        jornada: data.jornada ? String(data.jornada) : undefined,
        minutosTrabajados: minutosTrabajados ?? undefined,
        horasTrabajadas:
          minutosTrabajados !== null
            ? Math.round((minutosTrabajados / 60) * 100) / 100
            : undefined,
      };
    });
    onChange(items);
  });
};

export const registerAsistencia = async (profesorId: string) => {
  const now = new Date();
  const fecha = formatDateKey(now);
  const hora = formatTime(now);
  const nowMinutes = parseTimeToMinutes(hora) ?? 0;
  const docId = `${profesorId}_${fecha}`;

  const db = requireDb();
  const asistenciasCollection = collection(db, "asistencias");
  const profesoresCollection = collection(db, "profesores");

  return runTransaction(db, async (transaction) => {
    const ref = doc(asistenciasCollection, docId);
    const profesorRef = doc(profesoresCollection, profesorId);
    const profesorSnapshot = await transaction.get(profesorRef);
    const snapshot = await transaction.get(ref);

    const profesorData = profesorSnapshot.exists() ? profesorSnapshot.data() : null;
    const jornada = (profesorData?.jornada ?? null) as "mañana" | "tarde" | null;

    if (!snapshot.exists()) {
      transaction.set(ref, {
        profesorId,
        fecha,
        horaEntrada: hora,
        horaSalida: null,
        jornada,
        createdAt: serverTimestamp(),
      });
      return { status: "entrada" as const };
    }

    const data = snapshot.data();

    if (data.horaEntrada && data.horaSalida) {
      return { status: "error" as const, message: "Ya existe entrada y salida hoy." };
    }

    if (data.horaEntrada && !data.horaSalida) {
      const entradaMinutes = parseTimeToMinutes(String(data.horaEntrada)) ?? 0;
      if (nowMinutes - entradaMinutes < 5) {
        return {
          status: "error" as const,
          message: "Espera 5 minutos antes de registrar la salida.",
        };
      }
      transaction.update(ref, {
        horaSalida: hora,
        jornada,
      });
      return { status: "salida" as const };
    }

    if (!data.horaEntrada) {
      if (data.horaSalida) {
        return { status: "error" as const, message: "Estado invalido." };
      }
      transaction.update(ref, {
        horaEntrada: hora,
        jornada,
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

export const listAsistenciasByRange = async (params: {
  startDate: string;
  endDate: string;
  profesorId?: string;
  jornada?: "mañana" | "tarde";
}) => {
  const db = requireDb();
  const asistenciasCollection = collection(db, "asistencias");
  const filters = [
    where("fecha", ">=", params.startDate),
    where("fecha", "<=", params.endDate),
  ];

  if (params.profesorId) {
    filters.push(where("profesorId", "==", params.profesorId));
  }

  if (params.jornada) {
    filters.push(where("jornada", "==", params.jornada));
  }

  const snapshot = await getDocs(query(asistenciasCollection, ...filters));
  return snapshot.docs.map((docItem) => {
    const data = docItem.data();
    const minutosTrabajados = computeWorkedMinutes(
      data.horaEntrada ? String(data.horaEntrada) : null,
      data.horaSalida ? String(data.horaSalida) : null
    );
    return {
      id: docItem.id,
      profesorId: String(data.profesorId ?? ""),
      fecha: String(data.fecha ?? ""),
      horaEntrada: data.horaEntrada ? String(data.horaEntrada) : null,
      horaSalida: data.horaSalida ? String(data.horaSalida) : null,
      jornada: (data.jornada ?? null) as "mañana" | "tarde" | null,
      minutosTrabajados: minutosTrabajados ?? undefined,
      horasTrabajadas:
        minutosTrabajados !== null ? Math.round((minutosTrabajados / 60) * 100) / 100 : undefined,
      createdAt: data.createdAt?.toDate?.() ?? null,
    };
  });
};

export const subscribeAsistenciasByRange = (
  params: {
    startDate: string;
    endDate: string;
    profesorId?: string;
    jornada?: "mañana" | "tarde";
  },
  onChange: (items: Asistencia[]) => void
): Unsubscribe => {
  const db = requireDb();
  const asistenciasCollection = collection(db, "asistencias");
  const filters = [
    where("fecha", ">=", params.startDate),
    where("fecha", "<=", params.endDate),
  ];

  if (params.profesorId) {
    filters.push(where("profesorId", "==", params.profesorId));
  }

  if (params.jornada) {
    filters.push(where("jornada", "==", params.jornada));
  }

  const asistenciasQuery = query(asistenciasCollection, ...filters);
  return onSnapshot(asistenciasQuery, (snapshot) => {
    const items = snapshot.docs.map((docItem) => {
      const data = docItem.data();
      const minutosTrabajados = computeWorkedMinutes(
        data.horaEntrada ? String(data.horaEntrada) : undefined,
        data.horaSalida ? String(data.horaSalida) : undefined
      );
      return {
        id: docItem.id,
        profesorId: String(data.profesorId ?? ""),
        fecha: String(data.fecha ?? ""),
        horaEntrada: data.horaEntrada ? String(data.horaEntrada) : undefined,
        horaSalida: data.horaSalida ? String(data.horaSalida) : undefined,
        jornada: data.jornada ? String(data.jornada) : undefined,
        minutosTrabajados: minutosTrabajados ?? undefined,
        horasTrabajadas:
          minutosTrabajados !== null
            ? Math.round((minutosTrabajados / 60) * 100) / 100
            : undefined,
      };
    });
    onChange(items);
  });
};

export const summarizeWorkedMinutes = (asistencias: Asistencia[]) => {
  const totalMinutes = asistencias.reduce(
    (sum, asistencia) => sum + (asistencia.minutosTrabajados ?? 0),
    0
  );
  return {
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 100) / 100,
  };
};
