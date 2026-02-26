import { createContext, useCallback, useEffect, useMemo, useState } from "react";
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

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  setUser: () => {},
  logout: async () => {},
  login: async () => {},
  signup: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("domelink_token");
    if (!token) {
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
    } catch {
      // ignore network/logout race errors and still clear local session
    }
    api.clearToken();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  // --- NEW: login and signup implementations ---
  const login = useCallback(
    async (role: "homeowner" | "architect", email: string, password: string) => {
      // The backend expects role in the payload or as endpoint? Here, send as payload.
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
  // --- END NEW ---

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ user, loading, refresh, setUser, logout, login, signup }),
    [user, loading, refresh, logout, login, signup]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
