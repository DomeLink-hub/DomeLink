export type UserRole = "homeowner" | "architect" | "admin";
export type UserRole = "homeowner" | "architect" | "admin" | "CLIENT" | "ARCHITECT" | "ADMIN" | "SUPERADMIN";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  onboardingCompleted?: boolean;
  city?: string;
  projectType?: string;
  plotSize?: number;
  budgetMin?: number;
  budgetMax?: number;
  preferredStyles?: unknown;
  vastuPreference?: boolean;
  timeline?: string;
  familySize?: number;
  projectStage?: string;
}
