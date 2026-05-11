import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, type ApiUser } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextValue {
  user: ApiUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (user: ApiUser | null) => void;
  logout: () => Promise<void>;
  login: (role: "homeowner" | "architect", email: string, password: string) => Promise<void>;
  signup: (role: "homeowner" | "architect", name: string, email: string, password: string) => Promise<void>;
}

// 1. Remove "export" here. Keep it internal to this file.
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("domelink_token");
    if (!token || token === "undefined") {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await api.me();
      setUser(profile.user);
    } catch {
      api.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch { /* ignore */ }
    api.clearToken();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const login = useCallback(
    async (role: "homeowner" | "architect", email: string, password: string) => {
      const result = await api.login({ email, password });
      api.setToken(result.token);
      setUser(result.user);
    },
    []
  );

  const signup = useCallback(
    async (role: "homeowner" | "architect", name: string, email: string, password: string) => {
      const result = await api.register({ name, email, password, role });
      api.setToken(result.token);
      setUser(result.user);
    },
    []
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ user, loading, refresh, setUser, logout, login, signup }),
    [user, loading, refresh, logout, login, signup]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 2. Export this custom hook to access the context safely
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};