"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { getAdminProfile, loginWithEmail, logout, watchAuthState } from "@/lib/auth";
import type { AdminProfile } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  adminProfile: AdminProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
