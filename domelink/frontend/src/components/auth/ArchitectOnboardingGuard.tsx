import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const ArchitectOnboardingGuard = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  const isArchitect = user?.role === "ARCHITECT" || user?.role === "architect";

  if (!user) {
    return <Navigate to="/login?role=architect" replace />;
  }

  if (!isArchitect) {
    return <Outlet />;
  }

  const onboardingComplete = user.onboardingCompleted === true;

  if (!onboardingComplete && location.pathname !== "/architect/onboarding") {
    return <Navigate to="/architect/onboarding" replace />;
  }

  if (onboardingComplete && location.pathname === "/architect/onboarding") {
    return <Navigate to="/architect/dashboard" replace />;
  }

  return <Outlet />;
};

export default ArchitectOnboardingGuard;