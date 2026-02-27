
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
import LoaderScene from "@/components/3d/LoaderScene";

const ReviewSystem = lazy(() => import("./pages/architect/ReviewSystem"));
const PortfolioBuilder = lazy(() => import("./pages/architect/PortfolioBuilder"));
const ProjectBriefWizard = lazy(() => import("./pages/homeowner/ProjectBriefWizard"));
const BudgetRealityChecker = lazy(() => import("./pages/homeowner/BudgetRealityChecker"));
const StyleQuiz = lazy(() => import("./pages/homeowner/StyleQuiz"));

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
const Files = lazy(() => import("./pages/Files"));
const Blog = lazy(() => import("./pages/Blog"));
const Support = lazy(() => import("./pages/Support"));
const FAQ = lazy(() => import("./pages/FAQ"));
const DemoDashboard = lazy(() => import("./pages/DemoDashboard"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
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
            <Route
              path="/homeowner/dashboard"
              element={
                <ProtectedRoute roles={["homeowner", "admin"]}>
                  <HomeownerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/dashboard"
              element={
                <ProtectedRoute roles={["homeowner", "admin"]}>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/homeowner"
              element={
                <ProtectedRoute roles={["homeowner", "admin"]}>
                  <HomeownerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/homeowner/style-quiz"
              element={
                <ProtectedRoute roles={["homeowner", "admin"]}>
                  <StyleQuiz />
                </ProtectedRoute>
              }
            />
            <Route
              path="/homeowner/budget-reality"
              element={
                <ProtectedRoute roles={["homeowner", "admin"]}>
                  <BudgetRealityChecker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/homeowner/consultations"
              element={
                <ProtectedRoute roles={["homeowner", "admin"]}>
                  <ConsultationHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/homeowner/messages"
              element={
                <ProtectedRoute roles={["homeowner", "admin"]}>
                  <HomeownerMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/homeowner/project-brief"
              element={
                <ProtectedRoute roles={["homeowner", "admin"]}>
                  <HomeownerProjectBrief />
                </ProtectedRoute>
              }
            />
            <Route
              path="/homeowner/project-brief/wizard"
              element={
                <ProtectedRoute roles={["homeowner", "admin"]}>
                  <ProjectBriefWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/homeowner/saved"
              element={
                <ProtectedRoute roles={["homeowner", "admin"]}>
                  <SavedArchitects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/settings"
              element={
                <ProtectedRoute roles={["homeowner", "architect", "admin"]}>
                  <ProfileSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <RoleRoute roles={["admin"]}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <RoleRoute roles={["admin"]}>
                  <AdminAnalytics />
                </RoleRoute>
              }
            />
            <Route path="/architect/intro" element={<ArchitectIntro />} />
            <Route
              path="/architect/dashboard"
              element={
                <ProtectedRoute roles={["architect", "admin"]}>
                  <ArchitectDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/architect/portal"
              element={
                <ProtectedRoute roles={["architect", "admin"]}>
                  <ArchitectPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/architect/portfolio"
              element={
                <ProtectedRoute roles={["architect", "admin"]}>
                  <ArchitectPortfolio />
                </ProtectedRoute>
              }
            />
            <Route
              path="/architect/team"
              element={
                <ProtectedRoute roles={["architect", "admin"]}>
                  <ArchitectTeam />
                </ProtectedRoute>
              }
            />
            <Route path="/notifications" element={<ProtectedRoute roles={["homeowner", "architect", "admin"]}><Notifications /></ProtectedRoute>} />
            <Route path="/reviews" element={<ProtectedRoute roles={["homeowner", "architect", "admin"]}><Reviews /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute roles={["homeowner", "architect", "admin"]}><Payments /></ProtectedRoute>} />
            <Route path="/files" element={<ProtectedRoute roles={["homeowner", "architect", "admin"]}><Files /></ProtectedRoute>} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/support" element={<ProtectedRoute roles={["homeowner", "architect", "admin"]}><Support /></ProtectedRoute>} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/demo-dashboard" element={<DemoDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
      {/* Global Chatbot Toggle and Modal */}
      <>
        <button
          onClick={() => setChatOpen((v) => !v)}
          className="fixed bottom-6 right-6 z-[100] bg-foreground text-background rounded-full shadow-lg p-4 hover:bg-primary transition-all"
          aria-label="Open AI Chatbot"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>
        </button>
        <ChatModal
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          architect={{
            _id: "ai-bot",
            name: "Dome AI Assistant",
            specialty: "AI Chatbot",
            profileImage: "/placeholder.svg",
            location: "Cloud",
            rating: 5,
            startingPrice: 0,
            about: "Your helpful AI assistant for DomeLink.",
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

const App = () => (
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
);

export default App;
