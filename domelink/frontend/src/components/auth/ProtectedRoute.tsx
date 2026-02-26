import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/context/useAuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: Array<"homeowner" | "architect" | "admin">;
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <span className="text-body text-muted-foreground">Loading…</span>
      </div>
    );
  }

  if (!user) {
    const params = new URLSearchParams();
    params.set("from", `${location.pathname}${location.search}`);
    return <Navigate to={`/login?${params.toString()}`} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    if (user.role === "architect") return <Navigate to="/architect/dashboard" replace />;
    if (user.role === "homeowner") return <Navigate to="/homeowner/dashboard" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
