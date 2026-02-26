import { useCallback } from "react";
import { api } from "@/lib/api";

export const useAnalytics = () => {
  return useCallback((event: "profile_view" | "consultation_start" | "save" | "search_filter", metadata?: Record<string, unknown>) => {
    const token = localStorage.getItem("domelink_token");
    if (!token) return;
    void api.trackEvent(event, metadata);
  }, []);
};
