// src/components/auth/RoleRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface RoleRouteProps {
  // Update this array to match your exact Prisma roles
  allowedRoles: Array<"CLIENT" | "ARCHITECT" | "ADMIN" | "SUPERADMIN">;
}

const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not logged in at all
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in, but wrong role (e.g., Client trying to access Architect page)
  if (!allowedRoles.includes(user.role as any)) {
    // Safely eject them back to their own specific dashboard
    const fallbackRoute = user.role === "ARCHITECT" ? "/architect/dashboard" : "/homeowner/dashboard";
    return <Navigate to={fallbackRoute} replace />;
  }

  // Role verified, render the child routes
  return <Outlet />;
};

export default RoleRoute;