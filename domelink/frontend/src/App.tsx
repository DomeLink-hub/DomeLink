import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Suspense, lazy, useEffect, useState } from "react";
import ChatModal from "@/components/chat/ChatModal";
import { useAuth } from "@/hooks/useAuth";
import { AuthProvider } from "@/context/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleRoute from "@/components/auth/RoleRoute";
import OnboardingGuard from "@/components/auth/OnboardingGuard";
import LoaderScene from "@/components/3d/LoaderScene";

// ... [Keep all your lazy imports exactly the same] ...
const ReviewSystem = lazy(() => import("./pages/architect/ReviewSystem"));
const PortfolioBuilder = lazy(() => import("./pages/architect/PortfolioBuilder"));
const ProjectBriefWizard = lazy(() => import("./pages/homeowner/ProjectBriefWizard"));
const BudgetRealityChecker = lazy(() => import("./pages/homeowner/BudgetRealityChecker"));
const StyleQuiz = lazy(() => import("./pages/homeowner/StyleQuiz"));
const HomeownerOnboarding = lazy(() => import("./pages/homeowner/HomeownerOnboarding"));
const AvoraEstimate = lazy(() => import("./pages/homeowner/AvoraEstimate"));
const Index = lazy(() => import("./pages/Index"));
const ChooseRole = lazy(() => import("./pages/ChooseRole"));
const FindArchitects = lazy(() => import("./pages/FindArchitects"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const VerifiedArchitects = lazy(() => import("./pages/VerifiedArchitects"));
const FeaturedArchitects = lazy(() => import("./pages/FeaturedArchitects"));
const AboutDomeLink = lazy(() => import("./pages/AboutDomeLink"));
const Explore = lazy(() => import("./pages/Explore"));
const ArchitectProfile = lazy(() => import("./pages/ArchitectProfile"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Contact = lazy(() => import("./pages/Contact"));
const Consultation = lazy(() => import("./pages/Consultation"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const HomeownerDashboard = lazy(() => import("./pages/HomeownerDashboard"));
const ConsultationHistory = lazy(() => import("./pages/ConsultationHistory"));
const HomeownerMessages = lazy(() => import("./pages/HomeownerMessages"));
const HomeownerProjectBrief = lazy(() => import("./pages/HomeownerProjectBrief"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));
const SavedArchitects = lazy(() => import("./pages/SavedArchitects"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ArchitectIntro = lazy(() => import("./pages/ArchitectIntro"));
const ArchitectDashboard = lazy(() => import("./pages/ArchitectDashboard"));
const ArchitectPortal = lazy(() => import("./pages/ArchitectPortal"));
const ArchitectPortfolio = lazy(() => import("./pages/ArchitectPortfolio"));
const ArchitectTeam = lazy(() => import("./pages/ArchitectTeam"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Payments = lazy(() => import("./pages/Payments"));
const Messages = lazy(() => import("./pages/Messages"));
const Files = lazy(() => import("./pages/Files"));
const Blog = lazy(() => import("./pages/Blog"));
const Support = lazy(() => import("./pages/Support"));
const FAQ = lazy(() => import("./pages/FAQ"));
const DemoDashboard = lazy(() => import("./pages/DemoDashboard"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 min
      gcTime:    1000 * 60 * 30,       // 30 min
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403/404 — these are definitive
        if ([401, 403, 404].includes(error?.status)) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

const AppShell = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const isDark = true;
    document.documentElement.classList.toggle("dark", isDark);
    document.body.classList.toggle("dome-dark", isDark);
    document.body.classList.toggle("dome-light", !isDark);
  }, [location.pathname]);

  return (
    <>
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoaderScene />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/choose" element={<ChooseRole />} />
            <Route path="/find-architects" element={<FindArchitects />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/verified-architects" element={<VerifiedArchitects />} />
            <Route path="/featured-architects" element={<FeaturedArchitects />} />
            <Route path="/about" element={<AboutDomeLink />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/architect/:slug" element={<ArchitectProfile />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/consultation" element={<Consultation />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/demo-dashboard" element={<DemoDashboard />} />
            <Route path="/architect/intro" element={<ArchitectIntro />} />

            {/* General Protected Routes (Any logged in user) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile/settings" element={<ProfileSettings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/files" element={<Files />} />
              <Route path="/support" element={<Support />} />
            </Route>

            {/* Homeowner (CLIENT) Onboarding Guarded Routes */}
            <Route element={<RoleRoute allowedRoles={["CLIENT", "ADMIN", "SUPERADMIN"]} />}>
              <Route element={<OnboardingGuard />}>
                <Route path="/homeowner/dashboard" element={<HomeownerDashboard />} />
                <Route path="/client/dashboard" element={<ClientDashboard />} />
                <Route path="/homeowner" element={<HomeownerDashboard />} />
                <Route path="/homeowner/style-quiz" element={<StyleQuiz />} />
                <Route path="/homeowner/budget-reality" element={<BudgetRealityChecker />} />
                <Route path="/homeowner/consultations" element={<ConsultationHistory />} />
                <Route path="/homeowner/messages" element={<HomeownerMessages />} />
                <Route path="/homeowner/project-brief" element={<HomeownerProjectBrief />} />
                <Route path="/homeowner/project-brief/wizard" element={<ProjectBriefWizard />} />
                <Route path="/homeowner/saved" element={<SavedArchitects />} />
                <Route path="/homeowner/onboarding" element={<HomeownerOnboarding />} />
                <Route path="/homeowner/avora-estimate" element={<AvoraEstimate />} />
              </Route>
              {/* Onboarding route (unguarded so CLIENT can always access) */}
              <Route path="/homeowner/onboarding" element={<HomeownerOnboarding />} />
            </Route>

            {/* Architect Routes */}
            <Route element={<RoleRoute allowedRoles={["ARCHITECT", "ADMIN", "SUPERADMIN"]} />}>
              <Route path="/architect/dashboard" element={<ArchitectDashboard />} />
              <Route path="/architect/portal" element={<ArchitectPortal />} />
              <Route path="/architect/portfolio" element={<ArchitectPortfolio />} />
              <Route path="/architect/team" element={<ArchitectTeam />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<RoleRoute allowedRoles={["ADMIN", "SUPERADMIN"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>

      {/* Global Chatbot Toggle and Modal */}
      <>
        <button
          onClick={() => setChatOpen((v) => !v)}
          className="avora-toggle fixed bottom-6 right-6 z-[100] rounded-full w-16 h-16 p-1.5 flex items-center justify-center overflow-hidden border border-white/10 bg-[#1b1612]/80 shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-md hover:scale-105 hover:border-white/20 transition-all"
          aria-label="Ask Avora"
          title="Ask Avora"
        >
          <img src="/Avora.png" alt="Avora" className="block h-12 w-12 object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]" />
        </button>
        <ChatModal
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          architect={{
            _id: "ai-bot",
            name: "Avora",
            specialty: "Powered by Avora Intelligence",
            profileImage: "/Avora.png",
            location: "Cloud",
            rating: 5,
            startingPrice: 0,
            about: "Avora is your intelligent architecture assistant.",
            heroImage: "",
            projects: [],
            templates: [],
            experience: "Infinite",
            teamSize: 1,
            slug: "ai-bot"
          }}
          consultationId={null}
        />
      </>
    </>
  );
};

import { HelmetProvider } from 'react-helmet-async';

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppShell />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;