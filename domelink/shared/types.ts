export type UserRole = "homeowner" | "architect" | "admin";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}
