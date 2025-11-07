import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

type User = { id: string; email?: string } | null;

type AuthContextData = {
  user: User;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
    remember?: boolean
  ) => Promise<{ ok: true } | { ok: false; error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  const STORAGE_KEY = "@myapp:user";

  useEffect(() => {
    const restore = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setUser(JSON.parse(raw));
        }
      } catch (err) {
        console.warn("Erro ao restaurar sessão:", err);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const signIn = async (email: string, password: string, remember = false) => {
    const res = await authService.signIn(email, password, remember);
    if (res.ok) {
      setUser(res.user || { id: "local" });
      if (remember) {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(res.user));
        } catch (err) {
          console.warn("Erro ao salvar sessão:", err);
        }
      }
    }
    return res;
  };

  const signOut = async () => {
    setUser(null);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("Erro ao remover sessão:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
