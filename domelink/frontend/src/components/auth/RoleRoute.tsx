import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/context/useAuthContext";

interface RoleRouteProps {
  children: ReactNode;
  roles: Array<"homeowner" | "architect" | "admin">;
}

const RoleRoute = ({ children, roles }: RoleRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <span className="text-body text-muted-foreground">Loading…</span>
      </div>
    );
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
