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

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<ApiUser | null>(null);
  
  // Start loading as true so the app doesn't flash the "logged out" state before checking the token
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("domelink_token");
    
    if (!token || token === "undefined") {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch the user profile. 
      // NOTE: If your api.ts file calls this `getMe()` instead of `me()`, change it here!
      const profile = await api.me(); 
      setUser(profile.user);
    } catch (error) {
      // THE FIX: Stop failing silently! Log the error so we can see what's wrong.
      console.error("Session Refresh Failed. The token might be invalid or the backend rejected it:", error);
      
      api.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Backend logout failed, clearing local state anyway.", error);
    }
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
      // Strict frontend mapping to match Prisma Enums perfectly
      const strictRole = role === "homeowner" ? "CLIENT" : "ARCHITECT";
      
      const result = await api.register({ 
        name, 
        email, 
        password, 
        role: strictRole 
      });
      
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};