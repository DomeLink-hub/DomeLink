import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const finishAuth = async () => {
      const from = searchParams.get("from");
      const token = localStorage.getItem("domelink_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const profile = await api.me();
        const isClient = profile.user.role === "CLIENT" || profile.user.role === "homeowner";
        const target = isClient && profile.user.onboardingCompleted === false
          ? "/homeowner/onboarding"
          : from || (profile.user.role === "ARCHITECT" || profile.user.role === "architect" ? "/architect/portal" : "/homeowner/dashboard");
        navigate(target, {
          replace: true,
        });
      } catch {
        api.clearToken();
        navigate("/login", { replace: true });
      }
    };

    finishAuth();
  }, [navigate, searchParams]);

  return null;
};

export default AuthCallback;
