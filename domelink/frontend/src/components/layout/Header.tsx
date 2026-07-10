import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/useAuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

/* ── helpers ─────────────────────────────────────────────────── */
const dashboardFor = (role: string) => {
  if (role === "ARCHITECT" || role === "architect") return "/architect/dashboard";
  if (role === "ADMIN" || role === "SUPERADMIN" || role === "admin") return "/admin/dashboard";
  return "/homeowner/dashboard";
};

const normaliseRole = (role?: string): "guest" | "homeowner" | "architect" | "admin" => {
  if (!role) return "guest";
  const r = role.toUpperCase();
  if (r === "CLIENT") return "homeowner";
  if (r === "ARCHITECT") return "architect";
  if (r === "ADMIN" || r === "SUPERADMIN") return "admin";
  return "guest";
};

/* ── nav link sets ───────────────────────────────────────────── */
const publicLinks = [
  { label: "Explore",         to: "/explore" },
  { label: "Pricing",         to: "/pricing" },
];

const resourceLinks = [
  { label: "How it Works",        to: "/how-it-works" },
  { label: "About DomeLink",      to: "/about" },
  { label: "Verified Architects", to: "/verified-architects" },
  { label: "Blog",                to: "/blog" },
  { label: "Support",             to: "/support" },
  { label: "FAQ",                 to: "/faq" },
  { label: "Contact",             to: "/contact" },
];

const homeownerNav = [
  { label: "Dashboard",       to: "/homeowner/dashboard" },
  { label: "Messages",        to: "/messages" },
  { label: "Explore",         to: "/explore" },
  { label: "Avora Estimate",  to: "/homeowner/budget-reality" },
  { label: "Saved",           to: "/homeowner/saved" },
  { label: "Projects",        to: "/homeowner/project-brief" },
];

const architectNav = [
  { label: "Dashboard",  to: "/architect/dashboard" },
  { label: "Messages",   to: "/messages" },
  { label: "Portfolio",  to: "/architect/portfolio" },
  { label: "Projects",   to: "/architect/portal" },
  { label: "Team",       to: "/architect/team" },
];

const adminNav = [
  { label: "Dashboard",  to: "/admin/dashboard" },
  { label: "Analytics",  to: "/admin/analytics" },
];

const accountLinks = [
  { label: "Profile Settings", to: "/profile/settings" },
  { label: "Notifications",    to: "/notifications" },
  { label: "Payments",         to: "/payments" },
  { label: "Files",            to: "/files" },
];

/* ── component ───────────────────────────────────────────────── */
interface HeaderProps {
  variant?: "default" | "transparent" | "minimal";
}

const Header = ({ variant = "default" }: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const role = normaliseRole(user?.role);
  const isLoggedIn = Boolean(user);

  /* always transparent/overlay — matches the rest of the site */
  const isOverlay = variant !== "minimal";
  const navTone = "text-white/75 hover:text-white";

  const handleLogout = async () => {
    setMobileOpen(false);
    try { await logout(); } catch { /* noop */ }
    queryClient.clear();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    let active = true;

    const loadCount = async () => {
      if (!isLoggedIn) {
        if (active) setUnreadCount(0);
        return;
      }

      try {
        const result = await api.getNotificationCount();
        if (active) setUnreadCount(result.unreadCount);
      } catch {
        if (active) setUnreadCount(0);
      }
    };

    void loadCount();

    const handleNotification = () => {
      setUnreadCount((current) => current + 1);
    };

    socket.on("notification", handleNotification);

    return () => {
      active = false;
      socket.off("notification", handleNotification);
    };
  }, [isLoggedIn, user?._id]);

  /* pick the right primary nav links based on role */
  const primaryNav = useMemo(() => {
    if (!isLoggedIn) return publicLinks;
    if (role === "homeowner") return homeownerNav;
    if (role === "architect") return architectNav;
    if (role === "admin") return adminNav;
    return publicLinks;
  }, [isLoggedIn, role]);

  /* mobile nav sections */
  const mobileNavSections = useMemo(() => {
    if (!isLoggedIn) return [
      { label: "Explore",   links: publicLinks },
      { label: "Resources", links: resourceLinks },
    ];
    if (role === "homeowner") return [
      { label: "Workspace", links: homeownerNav },
      { label: "Resources", links: resourceLinks },
      { label: "Account",   links: accountLinks },
    ];
    if (role === "architect") return [
      { label: "Workspace", links: architectNav },
      { label: "Resources", links: resourceLinks },
      { label: "Account",   links: accountLinks },
    ];
    if (role === "admin") return [
      { label: "Admin",     links: adminNav },
      { label: "Account",   links: accountLinks },
    ];
    return [{ label: "Explore", links: publicLinks }];
  }, [isLoggedIn, role]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-0 left-0 right-0 z-50 py-5 px-6 md:px-12"
    >
      <div className="flex items-center justify-between w-full">

        {/* Logo */}
        <Link to={isLoggedIn ? dashboardFor(user?.role ?? "") : "/"} className="group flex-shrink-0">
          <span className="font-display text-xl md:text-2xl uppercase tracking-[0.2em] text-white group-hover:text-white/80 transition-colors duration-300 flex items-center gap-3">
            <span className="dome-orb" />
            DomeLink
          </span>
        </Link>

        {/* Desktop nav */}
        {isOverlay && (
          <nav className="hidden md:flex items-center gap-7">
            {primaryNav.map((link) => (
              <NavItem key={link.to} to={link.to}>{link.label}</NavItem>
            ))}

            {/* Resources dropdown — always visible */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn("text-caption transition-colors duration-200", navTone)}>
                  Resources
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[13rem]">
                <DropdownMenuLabel className="text-caption text-muted-foreground">Platform</DropdownMenuLabel>
                {resourceLinks.map((link) => (
                  <DropdownMenuItem key={link.to} asChild>
                    <Link to={link.to}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth / Account */}
            {isLoggedIn ? (
              <Link
                to="/notifications"
                className={cn(
                  "relative flex items-center gap-2 text-caption transition-colors duration-200",
                  navTone
                )}
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 min-w-5 h-5 px-1 rounded-full bg-amber-400 text-[10px] font-semibold text-black flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            ) : null}

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={cn(
                    "flex items-center gap-2 text-caption transition-colors duration-200",
                    navTone
                  )}>
                    <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px] font-medium uppercase">
                      {user?.name?.[0] ?? "U"}
                    </span>
                    Account
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[14rem]">
                  <DropdownMenuLabel>
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-xs text-muted-foreground font-normal capitalize">{role}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={dashboardFor(user?.role ?? "")}>Dashboard</Link>
                  </DropdownMenuItem>
                  {accountLinks.map((link) => (
                    <DropdownMenuItem key={link.to} asChild>
                      <Link to={link.to}>{link.label}</Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => void handleLogout()} className="text-destructive focus:text-destructive">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className={cn("text-caption transition-colors duration-200 dome-button-outline border-white/30 text-white hover:border-white hover:bg-white/10 py-2 px-4")}
              >
                Sign In
              </Link>
            )}
          </nav>
        )}

        {/* Mobile hamburger */}
        {isOverlay && (
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="md:hidden text-white/80 hover:text-white transition-colors p-2"
            aria-label="Toggle navigation"
            type="button"
          >
            <motion.div animate={mobileOpen ? "open" : "closed"} className="w-5 flex flex-col gap-1.5">
              <motion.span
                variants={{ open: { rotate: 45, y: 7 }, closed: { rotate: 0, y: 0 } }}
                className="block h-px w-full bg-current origin-center transition-all"
              />
              <motion.span
                variants={{ open: { opacity: 0, scaleX: 0 }, closed: { opacity: 1, scaleX: 1 } }}
                className="block h-px w-full bg-current"
              />
              <motion.span
                variants={{ open: { rotate: -45, y: -7 }, closed: { rotate: 0, y: 0 } }}
                className="block h-px w-full bg-current origin-center transition-all"
              />
            </motion.div>
          </button>
        )}
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && isOverlay && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden mt-4 rounded-2xl border border-white/10 bg-background/95 backdrop-blur-xl p-6 space-y-6 shadow-2xl"
          >
            {mobileNavSections.map((section) => (
              <div key={section.label} className="space-y-2">
                <p className="text-caption text-muted-foreground">{section.label}</p>
                {section.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block text-body-sm py-1.5 transition-colors",
                      location.pathname === link.to
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}

            <div className="pt-4 border-t border-border/40">
              {isLoggedIn ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium uppercase">
                      {user?.name?.[0] ?? "U"}
                    </span>
                    <div>
                      <p className="text-body-sm font-medium">{user?.name}</p>
                      <p className="text-caption text-muted-foreground capitalize">{role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => void handleLogout()}
                    className="text-body-sm text-destructive hover:text-destructive/80 transition-colors"
                    type="button"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="dome-button w-full justify-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

/* ── NavItem ─────────────────────────────────────────────────── */
const NavItem = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <Link
      to={to}
      className={cn(
        "text-caption transition-colors duration-200 link-underline",
        isActive ? "text-white" : "text-white/70 hover:text-white"
      )}
    >
      {children}
    </Link>
  );
};

export default Header;
