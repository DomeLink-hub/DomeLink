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
        navigate(from || (profile.user.role === "architect" ? "/architect/portal" : "/client/dashboard"), {
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
