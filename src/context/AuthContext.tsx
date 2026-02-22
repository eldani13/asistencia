"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "firebase/auth";
import { getAdminProfile, loginWithEmail, logout, watchAuthState } from "@/lib/auth";
import type { AdminProfile } from "@/types/admin/admin-profile";

type AuthContextValue = {
  user: User | null;
  adminProfile: AdminProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_DURATION_MS = 60 * 60 * 1000;
const SESSION_EXPIRES_KEY = "asistencia_session_expires";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = watchAuthState(async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setAdminProfile(null);
        setLoading(false);
        return;
      }

      const profile = await getAdminProfile(nextUser.uid);
      setAdminProfile(profile);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    if (!user) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(SESSION_EXPIRES_KEY);
      }
      return;
    }

    if (typeof window === "undefined") return;

    const now = Date.now();
    const stored = Number(localStorage.getItem(SESSION_EXPIRES_KEY) ?? 0);
    const expiresAt = stored > now ? stored : now + SESSION_DURATION_MS;
    localStorage.setItem(SESSION_EXPIRES_KEY, String(expiresAt));
    const remaining = expiresAt - now;

    if (remaining <= 0) {
      logout();
      return;
    }

    logoutTimerRef.current = setTimeout(() => {
      logout();
    }, remaining);

    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
    };
  }, [user]);

  const signIn = async (email: string, password: string) => {
    await loginWithEmail(email, password);
  };

  const signOut = async () => {
    await logout();
  };

  const value = useMemo(
    () => ({
      user,
      adminProfile,
      loading,
      signIn,
      signOut,
    }),
    [user, adminProfile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
