const HOMEOWNER_DRAFT_KEY = "domelink_homeowner_onboarding_draft";
const ARCHITECT_DRAFT_KEY = "domelink_architect_onboarding_draft";

export const getOnboardingDraftKey = (scope: "homeowner" | "architect", userId: string | null | undefined) => {
  const baseKey = scope === "homeowner" ? HOMEOWNER_DRAFT_KEY : ARCHITECT_DRAFT_KEY;
  return userId ? `${baseKey}_${userId}` : baseKey;
};

export const clearOnboardingDrafts = (userId?: string | null) => {
  const keys = [HOMEOWNER_DRAFT_KEY, ARCHITECT_DRAFT_KEY];

  if (userId) {
    keys.push(`${HOMEOWNER_DRAFT_KEY}_${userId}`);
    keys.push(`${ARCHITECT_DRAFT_KEY}_${userId}`);
  }

  for (const key of keys) {
    window.localStorage.removeItem(key);
  }
};