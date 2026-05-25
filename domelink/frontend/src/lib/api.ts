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
  id?: string;
  _id?: string;
  project?: string;
  payer?: string;
  payee?: string;
  payerId?: string;
  payeeId?: string;
  amount: number;
  status: string;
  method?: string;
  purpose?: string;
  currency?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}
export interface ClientLead {
  id: string;
  city: string | null;
  projectType: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  plotSize: number | null;
  styleTags: string[];
  timeline: string | null;
  familySize: number | null;
  createdAt: string;
  avoraScore?: number | null;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  paymentId?: string;
  amount: number;
  currency: string;
  pdfUrl?: string;
  issuedAt: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
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


export interface ProjectHealthReport {
  riskScore: number;
  timelineConfidence: number;
  communicationHealth: number;
  budgetStability: number;
  momentumScore: number;
  completionProbability: number;
  overallHealth: "Healthy" | "Needs Attention" | "At Risk" | "Critical";
  copilotInsights: string[];
  nextActions: string[];
  summary: string;
}

export interface AvoraReport {
  costRange: { min: number; max: number; currency: string };
  complexityScore: number;
  readinessScore: number;
  estimatedTimeline: string;
  architectTier: string;
  spacePlanning: string[];
  climateSuggestions: string[];
  sustainabilitySuggestions: string[];
  materialRecommendations: string[];
  interiorDirection: string;
  riskFactors: string[];
  budgetFeasibility: string;
  constructionDifficulty: string;
  designSummary: string;
  consultationPath: string;
  nextActions: string[];
  aiBudgetBreakdown: {
    construction: number;
    architecture: number;
    interiors: number;
    addOns: number;
    total: number;
    builtUpArea: number;
    psfRate: number;
    breakdown: {
      structure: number;
      finishing: number;
      mep: number;
      facade: number;
      landscape: number;
      addOns: number;
    };
  };
}

export interface AvoraEstimate {
  id: string;
  homeownerId: string;
  city: string;
  plotSize: number;
  floors: number;
  architectureStyle?: string;
  interiorTier?: string;
  report?: AvoraReport;
  status: string;
  createdAt: string;
}

import { frontendEnv } from "@/lib/env";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "homeowner" | "architect" | "admin" | "CLIENT" | "ARCHITECT" | "ADMIN" | "SUPERADMIN";
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
  designStyles?: unknown;
}

export interface ArchitectProject {
  id: string;
  title: string;
  image?: string;
  images?: string[];
  location: string;
  year: string;
  area?: string;
  description?: string;
  style?: string;
  projectType?: string;
  clientName?: string;
  featured?: boolean;
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
  profileImage?: string;
  projects: ArchitectProject[];
  templates: ArchitectTemplate[];
  experience: string;
  teamSize: number;
  isVerified?: boolean;
  isFeatured?: boolean;
  consultationFee?: number;
  completedProjects?: number;
  reviewCount?: number;
  trustScore?: number;
  designStyles?: string[];
  projectTypes?: string[];
  citiesServed?: string[];
  servicesOffered?: string[];
  portfolioProjects?: ArchitectProject[];
  recommendationReason?: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description?: string | null;
  status: "pending" | "in_progress" | "completed" | "blocked" | string;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  progress?: number;
  estimatedBudget?: number | null;
  estimatedTime?: string | null;
  consultation?: {
    user?: { id: string; name: string; avatar?: string | null };
    architect?: { id: string; name: string; avatar?: string | null; slug?: string | null };
  };
  milestones?: ProjectMilestone[];
}

export interface BudgetRealityResult {
  estimatedConstructionCost: number;
  architectFeeEstimate: number;
  interiorsEstimate: number;
  totalEstimatedCost: number;
  estimatedProjectTimelineMonths: number;
  recommendedArchitectCategories: string[];
  builtUpArea: number;
  psfRate: number;
}

export interface ConsultationSummaryResult {
  summary: string;
  leadScore: number;
  nextBestAction: string;
}

export interface ProjectSummaryResult {
  readinessScore: number;
  summary: string;
  stylisticMatch: string;
  nextBestAction: string;
}

export interface ProjectHealthInsight {
  healthTag: string;
  singleLineSummary: string;
}

export interface Consultation {
  _id: string;
  id?: string;
  userId: ApiUser;
  architectId: Pick<Architect, "_id" | "name" | "slug" | "specialty">;
  message: string;
  preferredDate?: string;
  projectType?: string;
  budget?: number;
  plotSize?: string;
  preferredStyle?: string;
  location?: string;
  status: "pending" | "active" | "closed" | "accepted" | "completed" | "rejected" | "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "REVIEW_PENDING" | "COMPLETED" | "CANCELLED";
  amount: number;
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: "message" | "project" | "review" | "system" | "consultation_status" | "lead_interest";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationCount {
  unreadCount: number;
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
  _id?: string;
  id?: string;
  consultationId: string;
  senderId?: { _id: string; name: string; role: string; avatar?: string };
  sender?: { id: string; name: string; role: string; avatar?: string };
  message: string;
  timestamp: string;
  readBy: Array<{ userId: string; readAt: string }>;
}

export interface SavedByClient {
  userId: string;
  city?: string | null;
  projectType?: string | null;
  budgetRange?: { min?: number | null; max?: number | null };
  styleTags?: string[];
  savedAt: string;
}

export interface ChatConversationItem {
  _id: string;
  id?: string;
  status: string;
  projectType?: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; avatar?: string | null; role: string; city?: string | null; projectType?: string | null };
  architect: { id: string; name: string; avatar?: string | null; role: string; city?: string | null; specialty?: string | null };
  lastMessage?: {
    id: string;
    message: string;
    timestamp: string;
    sender: { id: string; name: string; role: string; avatar?: string | null };
  } | null;
  unreadCount: number;
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
    credentials: "include",
  });

  let payload;
  try {
    payload = await response.json();
  } catch (e) {
    payload = { error: "Request failed" };
  }

  if (!response.ok) {
    const err = new Error(payload.error || payload.message || "Request failed") as Error & { status: number; details: unknown };
    err.status = response.status;
    err.details = payload;

    // Only attempt token refresh for authenticated endpoints, not for auth endpoints themselves
    if (response.status === 401 && !path.startsWith("/api/auth/")) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json().catch(() => null) as any;
          if (data?.token) {
            api.setToken(data.token);
            // Retry original request with new token
            const retryHeaders = new Headers(options.headers);
            retryHeaders.set("Content-Type", "application/json");
            retryHeaders.set("Authorization", `Bearer ${data.token}`);
            const retry = await fetch(`${API_BASE_URL}${path}`, {
              ...options,
              headers: retryHeaders,
              credentials: "include",
            });
            const retryPayload = await retry.json().catch(() => ({}));
            if (!retry.ok) {
              const retryErr = new Error(retryPayload.error || retryPayload.message || "Request failed") as Error & { status: number };
              retryErr.status = retry.status;
              throw retryErr;
            }
            return retryPayload as T;
          }
        }
      } catch (refreshErr: any) {
        if (refreshErr?.status !== 401) {
          console.error("Token refresh failed:", refreshErr);
        }
        api.clearToken();
      }
    }

    throw err;
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
    return request<File[]>("/api/storage/assets");
  },

  uploadFile(file: globalThis.File, scope: string = "project") {
    const token = getToken();
    const headers = new Headers();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const fd = new FormData();
    fd.append("file", file, file.name);
    fd.append("scope", scope);

    return fetch(`${API_BASE_URL}/api/storage/upload`, {
      method: "POST",
      headers,
      body: fd,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw { status: res.status, message: err.error || err.message || "Upload failed" };
      }
      return res.json();
    });
  },
  getPayments() {
    return request<Payment[]>("/api/payments/my");
  },
  createPaymentOrder(payload: {
    amount: number;
    planName: string;
    architectId: string;
    consultationId?: string;
  }) {
    return request<RazorpayOrderResponse>("/api/payments/create-order", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  verifyBookingPayment(payload: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) {
    return request<{ ok: boolean; payment: Payment; status?: string }>("/api/payments/verify", {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        purpose: "consultation",
      }),
    });
  },
  createConsultationPayment(payload: {
    architectId?: string;
    consultationId?: string;
    amount: number;
    currency?: string;
  }) {
    return request<{ payment: Payment; order: { id: string } }>("/api/payments/consultation", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  verifyPayment(payload: {
    orderId: string;
    paymentId: string;
    signature: string;
    purpose: "consultation" | "subscription" | "featured";
    tier?: string;
    architectId?: string;
    consultationId?: string;
  }) {
    return request<{ ok: boolean; payment: Payment }>("/api/payments/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getClientLeads(params?: { city?: string; budgetMin?: number; budgetMax?: number }) {
    const search = new URLSearchParams();
    if (params?.city) search.set("city", params.city);
    if (params?.budgetMin !== undefined) search.set("budgetMin", String(params.budgetMin));
    if (params?.budgetMax !== undefined) search.set("budgetMax", String(params.budgetMax));
    const suffix = search.toString() ? `?${search.toString()}` : "";
    return request<ClientLead[]>(`/api/leads${suffix}`);
  },
  expressInterestInLead(userId: string) {
    return request<{ ok: boolean }>(`/api/leads/${userId}/interest`, {
      method: "POST",
    });
  },
  getInvoices() {
    return request<Invoice[]>('/api/payments/invoices');
  },
  setToken(token: string) {
    localStorage.setItem("domelink_token", token);
  },
  clearToken() {
    localStorage.removeItem("domelink_token");
  },
  post<T = unknown>(path: string, body: unknown) {
    return request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
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
  register(payload: { name: string; email: string; password: string; role: string }) {
    return request<{ token: string; user: ApiUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  me() {
    return request<{ user: ApiUser; consultationCount: number; earnings: number }>("/api/users/me");
  },
  updateMe(payload: any) {
    return request<{ user: ApiUser }>("/api/users/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  getArchitects(params?: {
    minRating?: number;
    minBudget?: number;
    maxBudget?: number;
    city?: string;
    style?: string;
    projectType?: string;
    verified?: boolean;
    featured?: boolean;
  }) {
    const search = new URLSearchParams();
    if (params?.minRating) search.set("minRating", String(params.minRating));
    if (params?.minBudget) search.set("minBudget", String(params.minBudget));
    if (params?.maxBudget) search.set("maxBudget", String(params.maxBudget));
    if (params?.city) search.set("city", params.city);
    if (params?.style) search.set("style", params.style);
    if (params?.projectType) search.set("projectType", params.projectType);
    if (params?.verified !== undefined) search.set("verified", String(params.verified));
    if (params?.featured !== undefined) search.set("featured", String(params.featured));
    const suffix = search.toString() ? `?${search.toString()}` : "";
    return request<Architect[]>(`/api/architects${suffix}`);
  },
  getRecommendations(params?: {
    budgetMin?: number;
    budgetMax?: number;
    plotSize?: string;
    style?: string;
    location?: string;
    city?: string;
    projectType?: string;
    verified?: boolean;
    featured?: boolean;
  }) {
    const search = new URLSearchParams();
    if (params?.budgetMin) search.set("budgetMin", String(params.budgetMin));
    if (params?.budgetMax) search.set("budgetMax", String(params.budgetMax));
    if (params?.plotSize) search.set("plotSize", params.plotSize);
    if (params?.style) search.set("style", params.style);
    if (params?.location) search.set("location", params.location);
    if (params?.city) search.set("city", params.city);
    if (params?.projectType) search.set("projectType", params.projectType);
    if (params?.verified !== undefined) search.set("verified", String(params.verified));
    if (params?.featured !== undefined) search.set("featured", String(params.featured));
    const suffix = search.toString() ? `?${search.toString()}` : "";
    return request<Architect[]>(`/api/recommendations${suffix}`);
  },
  getHomeownerRecommendations(params?: {
    budgetMin?: number;
    budgetMax?: number;
    plotSize?: string;
    style?: string;
    location?: string;
    city?: string;
    projectType?: string;
    verified?: boolean;
    featured?: boolean;
    complexityScore?: number;
    interiorTier?: string;
    architectTier?: string;
    vastu?: boolean;
    sustainability?: boolean;
  }) {
    const search = new URLSearchParams();
    if (params?.budgetMin) search.set("budgetMin", String(params.budgetMin));
    if (params?.budgetMax) search.set("budgetMax", String(params.budgetMax));
    if (params?.plotSize) search.set("plotSize", params.plotSize);
    if (params?.style) search.set("style", params.style);
    if (params?.location) search.set("location", params.location);
    if (params?.city) search.set("city", params.city);
    if (params?.projectType) search.set("projectType", params.projectType);
    if (params?.verified !== undefined) search.set("verified", String(params.verified));
    if (params?.featured !== undefined) search.set("featured", String(params.featured));
    if (params?.complexityScore) search.set("complexityScore", String(params.complexityScore));
    if (params?.interiorTier) search.set("interiorTier", params.interiorTier);
    if (params?.architectTier) search.set("architectTier", params.architectTier);
    if (params?.vastu) search.set("vastu", "true");
    if (params?.sustainability) search.set("sustainability", "true");
    const suffix = search.toString() ? `?${search.toString()}` : "";
    return request<{ source: string; recommendations: Architect[] }>(`/api/recommendations/homeowner${suffix}`);
  },
  getArchitectBySlug(slug: string) {
    return request<Architect>(`/api/architects/${slug}`);
  },
  summarizeConsultation(consultation: unknown) {
    return request<ConsultationSummaryResult>("/api/ai/summarize-consultation", {
      method: "POST",
      body: JSON.stringify({ consultation }),
    });
  },
  summarizeProject(project: unknown) {
    return request<ProjectSummaryResult>("/api/ai/summarize-project", {
      method: "POST",
      body: JSON.stringify({ project }),
    });
  },
  getProjectHealthInsight(project: unknown) {
    return request<ProjectHealthInsight>("/api/ai/project-health", {
      method: "POST",
      body: JSON.stringify({ project }),
    });
  },
  getBudgetReality(payload: {
    city: string;
    projectType: string;
    plotArea: number;
    floors: number;
    qualityTier: "economy" | "standard" | "premium" | "luxury";
    interiors: boolean;
    vastu: boolean;
  }) {
    return request<BudgetRealityResult>("/api/ai/budget", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getMyProjects() {
    return request<Project[]>("/api/projects/my");
  },
  getProjectDetails(projectId: string) {
    return request<Project>(`/api/projects/${projectId}`);
  },
  createProject(payload: { consultationId: string; title: string; description: string; estimatedBudget?: number; estimatedTime?: string }) {
    return request<Project>("/api/projects", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  createMilestone(projectId: string, payload: { title: string; description?: string; dueDate?: string }) {
    return request<ProjectMilestone>(`/api/projects/${projectId}/milestone`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateMilestoneStatus(milestoneId: string, status: ProjectMilestone["status"]) {
    return request<ProjectMilestone>(`/api/projects/milestone/${milestoneId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },
  getMyArchitect() {
    return request<Architect>("/api/architects/me");
  },
  getMyArchitectStats() {
    return request<ArchitectStats>("/api/architects/me/stats");
  },
  getConsultations() {
    return request<any[]>("/api/consultations/my").then((rows) =>
      rows.map((row) => ({
        ...row,
        _id: row._id || row.id,
        userId: row.userId || row.user,
        architectId: row.architectId || row.architect,
      })) as Consultation[],
    );
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
    return request<any>("/api/consultations", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((row) => ({
      ...row,
      _id: row._id || row.id,
    }) as Consultation);
  },
  updateConsultationStatus(
    consultationId: string,
    status: "accepted" | "rejected" | "start" | "complete" | "cancel" | Consultation["status"],
  ) {
    const action = String(status).toLowerCase();

    if (action === "accepted") {
      return request<Consultation>(`/api/consultations/${consultationId}/accept`, { method: "PATCH" });
    }
    if (action === "start") {
      return request<Consultation>(`/api/consultations/${consultationId}/start`, { method: "PATCH" });
    }
    if (action === "complete") {
      return request<Consultation>(`/api/consultations/${consultationId}/complete`, { method: "PATCH" });
    }
    if (action === "cancel" || action === "rejected") {
      return request<Consultation>(`/api/consultations/${consultationId}/cancel`, { method: "PATCH" });
    }

    return request<Consultation>(`/api/consultations/${consultationId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
  getChat(consultationId: string) {
    return request<ChatMessage[]>(`/api/chat/${consultationId}`);
  },
  getChatConversations() {
    return request<ChatConversationItem[]>("/api/chat/conversations");
  },
  getChatGrouped(consultationId: string) {
    return request<GroupedChatResponse>(`/api/chat/${consultationId}/grouped`);
  },
  sendChat(consultationId: string, message: string) {
    return request<ChatMessage>(`/api/chat/${consultationId}/messages`, {
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
  getMySavers() {
    return request<SavedByClient[]>("/api/saved/my-savers");
  },
  startConversationWithSaver(userId: string) {
    return request<Consultation>(`/api/saved/my-savers/${userId}/conversation`, {
      method: "POST",
    });
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
  getAdminBilling() {
    return request<{ payments: Payment[]; subscriptions: any[]; featuredPlacements: any[]; uploads: any[] }>("/api/admin/billing");
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
  moderateUpload(assetId: string, isApproved: boolean) {
    return request<any>(`/api/admin/uploads/${assetId}`, {
      method: "PATCH",
      body: JSON.stringify({ isApproved }),
    });
  },
  manageFeaturedPlacement(placementId: string, isActive: boolean, rank?: number) {
    return request<any>(`/api/admin/featured/${placementId}`, {
      method: "PATCH",
      body: JSON.stringify({ isActive, rank }),
    });
  },
  // Admin webhook management
  getWebhooks(page = 1, limit = 50) {
    return request<{ items: any[]; total: number; page: number; limit: number }>(`/api/admin/webhooks?page=${page}&limit=${limit}`);
  },
  getWebhook(webhookId: string) {
    return request<any>(`/api/admin/webhooks/${webhookId}`);
  },
  replayWebhook(webhookId: string) {
    return request<any>(`/api/admin/webhooks/${webhookId}/replay`, { method: "POST" });
  },
  getWebhookReplays(webhookId: string) {
    return request<any[]>(`/api/admin/webhooks/${webhookId}/replays`);
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
  getNotificationCount() {
    return request<NotificationCount>("/api/notifications/count");
  },
  markNotificationRead(notificationId: string) {
    return request<Notification>(`/api/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
  },
  generateAvoraEstimate(payload: {
    city: string; locationType?: string; plotSize: number; builtUpArea?: number;
    floors: number; timeline?: string; familySize?: number; architectureStyle?: string;
    lifestyleFeatures?: string[]; interiorTier?: string; vastuRequired?: boolean;
    prayerRoom?: boolean; courtyard?: boolean; budgetMin?: number; budgetMax?: number;
    budgetFlexibility?: string; materialPreference?: string;
  }) {
    return request<{ id: string; report: AvoraReport }>("/api/ai/avora-estimate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getAvoraEstimates() {
    return request<AvoraEstimate[]>("/api/ai/avora-estimates");
  },
  getProjectHealth(context: {
    projectTitle?: string; status?: string; progress?: number;
    estimatedBudget?: number; estimatedTime?: string;
    milestones?: Array<{ title: string; status: string; dueDate?: string }>;
    consultationCount?: number; lastActivityDaysAgo?: number;
    architectureStyle?: string; complexity?: number;
  }) {
    return request<ProjectHealthReport>("/api/ai/project-health", {
      method: "POST",
      body: JSON.stringify(context),
    });
  },
  generateConsultationBrief(consultation: unknown) {
    return request<{ brief: string }>("/api/ai/consultation-brief", {
      method: "POST",
      body: JSON.stringify({ consultation }),
    });
  },
};
