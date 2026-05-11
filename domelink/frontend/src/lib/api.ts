export interface SupportTicket {
  _id: string;
  user: string;
  subject: string;
  message: string;
  status: "open" | "pending" | "closed";
  createdAt: string;
}
export interface BlogPost {
  _id: string;
  author: string;
  title: string;
  content: string;
  tags: string[];
  published: boolean;
  createdAt: string;
}
export interface File {
  _id: string;
  project: string;
  uploader: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}
export interface Payment {
  _id: string;
  project: string;
  payer: string;
  payee: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  method: "card" | "bank" | "cash";
  createdAt: string;
}
export interface Review {
  _id: string;
  project?: string;
  reviewer?: { _id: string; name: string } | string;
  reviewee?: { _id: string; name: string } | string;
  rating: number;
  comment: string;
  createdAt: string;
}


import { frontendEnv } from "@/lib/env";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "homeowner" | "architect" | "admin";
  avatar?: string;
}

export interface ArchitectProject {
  id: string;
  title: string;
  image: string;
  location: string;
  year: string;
  area?: string;
}

export interface ArchitectTemplate {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Architect {
  _id: string;
  slug: string;
  name: string;
  location: string;
  specialty: string;
  rating: number;
  startingPrice: number;
  about: string;
  heroImage: string;
  profileImage: string;
  projects: ArchitectProject[];
  templates: ArchitectTemplate[];
  experience: string;
  teamSize: number;
}

export interface Consultation {
  _id: string;
  userId: ApiUser;
  architectId: Pick<Architect, "_id" | "name" | "slug" | "specialty">;
  message: string;
  preferredDate?: string;
  projectType?: string;
  budget?: number;
  plotSize?: string;
  preferredStyle?: string;
  location?: string;
  status: "pending" | "active" | "closed" | "accepted" | "completed" | "rejected";
  amount: number;
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: "message" | "project" | "review" | "system";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}
export interface ProjectBrief {
  _id: string;
  homeownerId: string;
  projectName: string;
  projectType: "residential" | "commercial" | "interior" | "landscape";
  plotSize: string;
  budget: string;
  location: string;
  stylePreferences: string[];
  timeline: string;
  requirements: string;
  inspirationImages: string[];
  status: "draft" | "submitted" | "in_progress" | "completed";
  createdAt: string;
  updatedAt: string;
}

// All interfaces above this line

export interface ChatMessage {
  _id: string;
  consultationId: string;
  senderId: { _id: string; name: string; role: string; avatar?: string };
  message: string;
  timestamp: string;
  readBy: Array<{ userId: string; readAt: string }>;
}

export interface GroupedChatResponse {
  consultationId: string;
  grouped: Array<{ date: string; messages: ChatMessage[] }>;
}

export interface TeamMember {
  _id: string;
  architectId: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: "online" | "offline" | "away";
}

export interface TeamInvite {
  _id: string;
  architectId: string;
  email: string;
  role: string;
  status: "pending" | "accepted" | "expired";
  expiresAt: string;
  createdAt: string;
}

export interface PortfolioProject {
  _id: string;
  architectId: string;
  title: string;
  images: string[];
  description: string;
  location?: string;
  year?: string;
  area?: string;
}

export type AnalyticsEventType = "profile_view" | "consultation_start" | "save" | "search_filter";

export interface AnalyticsSummary {
  totals: number;
  byEvent: Array<{ _id: AnalyticsEventType; count: number }>;
  daily30: Array<{ _id: string; count: number }>;
  daily7: Array<{ _id: string; count: number }>;
}

export interface ArchitectStats {
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  closedRequests: number;
  profileViews: number;
  monthlyEarnings: number;
  totalEarnings: number;
  thisMonthRequests: number;
}

export interface AdminOverview {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalArchitects: number;
  verifiedArchitects: number;
  pendingArchitects: number;
  totalConsultations: number;
  activeConsultations: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "homeowner" | "architect" | "admin";
  status: "active" | "suspended";
  createdAt: string;
}

export interface AdminArchitect {
  _id: string;
  name: string;
  slug: string;
  specialty: string;
  location: string;
  moderationStatus: "pending" | "approved" | "rejected";
  isVerified: boolean;
  createdAt: string;
}

const API_BASE_URL = frontendEnv.VITE_API_BASE_URL;

const getToken = () => {
  const token = localStorage.getItem("domelink_token");
  // Prevent sending the literal string "undefined" if a previous login errored out
  if (token === "undefined" || token === "null") return null;
  return token;
};
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let payload;
  try {
    payload = await response.json();
  } catch (e) {
    payload = { error: "Request failed" };
  }

  if (!response.ok) {
    const errorObj = {
      status: response.status,
      message: payload.error || payload.message || "Request failed",
      details: payload,
    };
    
    // HARDENED EJECTOR SEAT: 
    // Only wipe the token if the primary auth verification fails.
    // This prevents a random broken endpoint (like /api/notifications) from logging you out.
    if (response.status === 401 && path === "/api/users/me") {
      api.clearToken();
    }
    throw errorObj;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return payload as T;
}

export const api = {
  getSupportTickets() {
    return request<SupportTicket[]>("/api/support/my");
  },
  getBlogPosts() {
    return request<BlogPost[]>("/api/blog/my");
  },
  getFiles() {
    return request<File[]>("/api/files/my");
  },
  getPayments() {
    return request<Payment[]>("/api/payments/my");
  },
  setToken(token: string) {
    localStorage.setItem("domelink_token", token);
  },
  clearToken() {
    localStorage.removeItem("domelink_token");
  },
  login(payload: { email: string; password: string }) {
    return request<{ token: string; user: ApiUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  logout() {
    return request<{ ok: boolean }>("/api/auth/logout", {
      method: "POST",
    });
  },
  register(payload: { name: string; email: string; password: string; role: "homeowner" | "architect" }) {
    return request<{ token: string; user: ApiUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  me() {
    return request<{ user: ApiUser; consultationCount: number; earnings: number }>("/api/users/me");
  },
  updateMe(payload: { name?: string; avatar?: string; styleTags?: string[] }) {
    return request<{ user: ApiUser }>("/api/users/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  getArchitects(params?: { minRating?: number; minBudget?: number; maxBudget?: number }) {
    const search = new URLSearchParams();
    if (params?.minRating) search.set("minRating", String(params.minRating));
    if (params?.minBudget) search.set("minBudget", String(params.minBudget));
    if (params?.maxBudget) search.set("maxBudget", String(params.maxBudget));
    const suffix = search.toString() ? `?${search.toString()}` : "";
    return request<Architect[]>(`/api/architects${suffix}`);
  },
  getRecommendations(params?: {
    budgetMin?: number;
    budgetMax?: number;
    plotSize?: string;
    style?: string;
    location?: string;
  }) {
    const search = new URLSearchParams();
    if (params?.budgetMin) search.set("budgetMin", String(params.budgetMin));
    if (params?.budgetMax) search.set("budgetMax", String(params.budgetMax));
    if (params?.plotSize) search.set("plotSize", params.plotSize);
    if (params?.style) search.set("style", params.style);
    if (params?.location) search.set("location", params.location);
    const suffix = search.toString() ? `?${search.toString()}` : "";
    return request<Architect[]>(`/api/recommendations${suffix}`);
  },
  getHomeownerRecommendations(params?: {
    budgetMin?: number;
    budgetMax?: number;
    plotSize?: string;
    style?: string;
    location?: string;
  }) {
    const search = new URLSearchParams();
    if (params?.budgetMin) search.set("budgetMin", String(params.budgetMin));
    if (params?.budgetMax) search.set("budgetMax", String(params.budgetMax));
    if (params?.plotSize) search.set("plotSize", params.plotSize);
    if (params?.style) search.set("style", params.style);
    if (params?.location) search.set("location", params.location);
    const suffix = search.toString() ? `?${search.toString()}` : "";
    return request<{ source: string; recommendations: Architect[] }>(`/api/recommendations/homeowner${suffix}`);
  },
  getArchitectBySlug(slug: string) {
    return request<Architect>(`/api/architects/${slug}`);
  },
  getMyArchitect() {
    return request<Architect>("/api/architects/me");
  },
  getMyArchitectStats() {
    return request<ArchitectStats>("/api/architects/me/stats");
  },
  getConsultations() {
    return request<Consultation[]>("/api/consultations/my");
  },
  getMyProjectBriefs() {
    return request<ProjectBrief[]>("/api/project-briefs/my");
  },
  createProjectBrief(payload: Omit<ProjectBrief, "_id" | "homeownerId" | "createdAt" | "updatedAt">) {
    return request<ProjectBrief>("/api/project-briefs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateProjectBrief(briefId: string, payload: Partial<Omit<ProjectBrief, "_id" | "homeownerId" | "createdAt" | "updatedAt">>) {
    return request<ProjectBrief>(`/api/project-briefs/${briefId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  createConsultation(payload: {
    architectId?: string;
    message: string;
    preferredDate?: string;
    projectType?: string;
    budget?: number;
    plotSize?: string;
    preferredStyle?: string;
    location?: string;
  }) {
    return request<Consultation>("/api/consultations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateConsultationStatus(consultationId: string, status: Consultation["status"]) {
    return request<Consultation>(`/api/consultations/${consultationId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
  getChat(consultationId: string) {
    return request<ChatMessage[]>(`/api/chat/${consultationId}`);
  },
  getChatGrouped(consultationId: string) {
    return request<GroupedChatResponse>(`/api/chat/${consultationId}/grouped`);
  },
  sendChat(consultationId: string, message: string) {
    return request<ChatMessage>(`/api/chat/${consultationId}`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },
  markChatRead(consultationId: string) {
    return request<{ updatedCount: number }>(`/api/chat/${consultationId}/read`, {
      method: "PATCH",
    });
  },
  getSavedArchitects() {
    return request<Architect[]>("/api/saved/my");
  },
  saveArchitect(architectId: string) {
    return request<{ ok: boolean }>("/api/saved", {
      method: "POST",
      body: JSON.stringify({ architectId }),
    });
  },
  unsaveArchitect(architectId: string) {
    return request<{ ok: boolean }>(`/api/saved/${architectId}`, { method: "DELETE" });
  },
  getPortfolio(architectId: string) {
    return request<PortfolioProject[]>(`/api/portfolio/${architectId}`);
  },
  createPortfolio(payload: Omit<PortfolioProject, "_id">) {
    return request<PortfolioProject>("/api/portfolio", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updatePortfolio(projectId: string, payload: Partial<PortfolioProject>) {
    return request<PortfolioProject>(`/api/portfolio/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  deletePortfolio(projectId: string) {
    return request<void>(`/api/portfolio/${projectId}`, { method: "DELETE" });
  },
  getTeam(architectId: string) {
    return request<TeamMember[]>(`/api/team/${architectId}`);
  },
  getTeamInvites(architectId: string) {
    return request<TeamInvite[]>(`/api/team/${architectId}/invites`);
  },
  inviteTeamMember(payload: { architectId: string; email: string; role: string }) {
    return request<TeamInvite>("/api/team/invite", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  acceptTeamInvite(token: string) {
    return request<{ ok: boolean }>(`/api/team/invite/${token}/accept`, {
      method: "POST",
    });
  },
  addTeam(payload: Omit<TeamMember, "_id">) {
    return request<TeamMember>("/api/team", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  removeTeam(memberId: string) {
    return request<void>(`/api/team/${memberId}`, { method: "DELETE" });
  },
  trackEvent(event: AnalyticsEventType, metadata?: Record<string, unknown>) {
    return request<void>("/api/analytics", {
      method: "POST",
      body: JSON.stringify({ event, metadata }),
    });
  },
  getAnalytics(days = 30) {
    return request<{ event: AnalyticsEventType; metadata: Record<string, unknown>; createdAt: string }[]>(`/api/analytics?days=${days}`);
  },
  getAnalyticsSummary() {
    return request<AnalyticsSummary>("/api/analytics/summary");
  },
  getAdminOverview() {
    return request<AdminOverview>("/api/admin/overview");
  },
  getAdminUsers() {
    return request<AdminUser[]>("/api/admin/users");
  },
  updateAdminUserStatus(userId: string, status: AdminUser["status"]) {
    return request<AdminUser>(`/api/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
  getAdminArchitects() {
    return request<AdminArchitect[]>("/api/admin/architects");
  },
  updateAdminArchitectModeration(
    architectId: string,
    payload: { moderationStatus: AdminArchitect["moderationStatus"]; isVerified: boolean },
  ) {
    return request<AdminArchitect>(`/api/admin/architects/${architectId}/moderation`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  checkBudgetReality(payload: { budget: number; plotSize: string; projectType: string }) {
    return request<{ message: string; suggestions?: string[]; error?: string }>("/api/budget/reality-check", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getReviews(architectId: string) {
    return request<Review[]>(`/api/reviews/${architectId}`);
  },
  getMyReviews() {
    return request<Review[]>("/api/reviews/my");
  },
  createReview(payload: { architectId: string; rating: number; comment: string; project?: string }) {
    const { architectId, ...body } = payload;
    return request<Review>(`/api/reviews/architect/${architectId}`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  // FIX: Use correct plural endpoint for notifications
  getNotifications() {
    return request<Notification[]>("/api/notifications/my");
  },
  markNotificationRead(notificationId: string) {
    return request<Notification>(`/api/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
  },
};
