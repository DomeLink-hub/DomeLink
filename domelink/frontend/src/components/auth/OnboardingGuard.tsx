import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * Guards homeowner routes: if onboarding is not complete, redirect to onboarding.
 * Only applies to CLIENT role.
 */
const OnboardingGuard = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isClient = user?.role === "CLIENT" || user?.role === "homeowner";

  if (user && isClient && user.onboardingCompleted === false) {
    if (location.pathname === "/homeowner/onboarding") return <Outlet />;
    return <Navigate to="/homeowner/onboarding" replace />;
  }

  if (user && isClient && user.onboardingCompleted === true && location.pathname === "/homeowner/onboarding") {
    return <Navigate to="/homeowner/dashboard" replace />;
  }

  // Otherwise, allow normal flow
  return <Outlet />;
};

export default OnboardingGuard;
