import { Link, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/useAuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const roleHome = (role: "homeowner" | "architect" | "admin") => {
  if (role === "architect") return "/architect/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/homeowner/dashboard";
};

interface HeaderProps {
  variant?: "default" | "transparent" | "minimal";
}

const Header = ({ variant = "default" }: HeaderProps) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const resolvedVariant = variant === "default" ? "transparent" : variant;
  const [mobileOpen, setMobileOpen] = useState(false);

  const variantClasses = {
    default: "bg-transparent absolute top-0 left-0 right-0 z-50",
    transparent: "bg-transparent absolute top-0 left-0 right-0 z-50",
    minimal: "bg-transparent absolute top-0 left-0 right-0 z-50",
  };

  const navTone =
    resolvedVariant === "transparent" || resolvedVariant === "minimal"
      ? "text-white/80 hover:text-white"
      : "text-muted-foreground hover:text-foreground";

  const primaryLinks = useMemo(
    () => [
      { label: "Find Architects", to: "/find-architects" },
      { label: "Explore", to: "/explore" },
      { label: "Pricing", to: "/pricing" },
    ],
    [],
  );

  const homeownerLinks = useMemo(
    () => [
      { label: "Homeowner Dashboard", to: "/homeowner/dashboard" },
      { label: "Project Briefs", to: "/homeowner/project-brief" },
      { label: "Brief Wizard", to: "/homeowner/project-brief/wizard" },
      { label: "Saved Architects", to: "/homeowner/saved" },
      { label: "Style Quiz", to: "/homeowner/style-quiz" },
      { label: "Budget Reality Check", to: "/homeowner/budget-reality" },
    ],
    [],
  );

  const architectLinks = useMemo(
    () => [
      { label: "Architect Dashboard", to: "/architect/dashboard" },
      { label: "Architect Portal", to: "/architect/portal" },
      { label: "Portfolio Builder", to: "/architect/portfolio" },
      { label: "Team Workspace", to: "/architect/team" },
      { label: "Architect Intro", to: "/architect/intro" },
    ],
    [],
  );

  const resourceLinks = useMemo(
    () => [
      { label: "How it Works", to: "/how-it-works" },
      { label: "About DomeLink", to: "/about" },
      { label: "Verified Architects", to: "/verified-architects" },
      { label: "Blog", to: "/blog" },
      { label: "Support", to: "/support" },
      { label: "FAQ", to: "/faq" },
      { label: "Contact", to: "/contact" },
    ],
    [],
  );

  const accountLinks = useMemo(
    () => [
      { label: "Profile Settings", to: "/profile/settings" },
      { label: "Notifications", to: "/notifications" },
      { label: "Reviews", to: "/reviews" },
      { label: "Payments", to: "/payments" },
      { label: "Files", to: "/files" },
      { label: "Demo Dashboard", to: "/demo-dashboard" },
    ],
    [],
  );

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "py-6 px-6 md:px-12",
        variantClasses[resolvedVariant]
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
        <div className="md:hidden flex justify-end mb-2">
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="dome-button px-3 py-2 text-lg"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
            type="button"
          >
            ☰
          </button>
        </div>
        <Link to="/" className="group">
          <span className={cn(
            "font-display text-xl md:text-2xl uppercase tracking-[0.2em] transition-colors duration-300 flex items-center gap-3",
            resolvedVariant === "transparent" || resolvedVariant === "minimal" 
              ? "text-white group-hover:text-white/80" 
              : "text-foreground group-hover:text-foreground/70"
          )}>
            <span className="dome-orb" />
            DomeLink
          </span>
        </Link>

        {resolvedVariant !== "minimal" && (
          <>
            <nav className="hidden md:flex flex-nowrap items-center gap-6 w-full md:w-auto mt-0 animate-fade-in">
              {primaryLinks.map((link) => (
                <NavItem key={link.to} to={link.to} variant={resolvedVariant}>
                  {link.label}
                </NavItem>
              ))}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={cn("text-caption transition-colors duration-300 link-underline", navTone)}>
                    Homeowners
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[14rem]">
                  <DropdownMenuLabel>Homeowner Journeys</DropdownMenuLabel>
                  {homeownerLinks.map((link) => (
                    <DropdownMenuItem key={link.to} asChild>
                      <Link to={link.to}>{link.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={cn("text-caption transition-colors duration-300 link-underline", navTone)}>
                    Architects
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[14rem]">
                  <DropdownMenuLabel>Architect Workspace</DropdownMenuLabel>
                  {architectLinks.map((link) => (
                    <DropdownMenuItem key={link.to} asChild>
                      <Link to={link.to}>{link.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={cn("text-caption transition-colors duration-300 link-underline", navTone)}>
                    Resources
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[14rem]">
                  <DropdownMenuLabel>Platform</DropdownMenuLabel>
                  {resourceLinks.map((link) => (
                    <DropdownMenuItem key={link.to} asChild>
                      <Link to={link.to}>{link.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={cn("text-caption transition-colors duration-300 link-underline", navTone)}>
                      Account
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[14rem]">
                    <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link to={roleHome(user.role)}>Dashboard</Link>
                    </DropdownMenuItem>
                    {accountLinks.map((link) => (
                      <DropdownMenuItem key={link.to} asChild>
                        <Link to={link.to}>{link.label}</Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/login">Switch Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        void logout();
                      }}
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <NavItem to="/login" variant={resolvedVariant}>
                  Sign In
                </NavItem>
              )}
            </nav>

            <div
              className={cn(
                "md:hidden flex flex-col gap-4 bg-background rounded-2xl shadow-lg p-6 mt-3 animate-fade-in",
                mobileOpen ? "block" : "hidden",
              )}
            >
              <div className="grid gap-3">
                <span className="text-caption text-muted-foreground">Explore</span>
                {primaryLinks.map((link) => (
                  <NavItem key={link.to} to={link.to} variant={resolvedVariant}>
                    {link.label}
                  </NavItem>
                ))}
              </div>
              <div className="grid gap-3">
                <span className="text-caption text-muted-foreground">Homeowners</span>
                {homeownerLinks.map((link) => (
                  <NavItem key={link.to} to={link.to} variant={resolvedVariant}>
                    {link.label}
                  </NavItem>
                ))}
              </div>
              <div className="grid gap-3">
                <span className="text-caption text-muted-foreground">Architects</span>
                {architectLinks.map((link) => (
                  <NavItem key={link.to} to={link.to} variant={resolvedVariant}>
                    {link.label}
                  </NavItem>
                ))}
              </div>
              <div className="grid gap-3">
                <span className="text-caption text-muted-foreground">Resources</span>
                {resourceLinks.map((link) => (
                  <NavItem key={link.to} to={link.to} variant={resolvedVariant}>
                    {link.label}
                  </NavItem>
                ))}
              </div>
              {user ? (
                <div className="grid gap-3">
                  <span className="text-caption text-muted-foreground">Account</span>
                  <NavItem to={roleHome(user.role)} variant={resolvedVariant}>
                    Dashboard
                  </NavItem>
                  {accountLinks.map((link) => (
                    <NavItem key={link.to} to={link.to} variant={resolvedVariant}>
                      {link.label}
                    </NavItem>
                  ))}
                  <button
                    onClick={() => {
                      void logout();
                    }}
                    className={cn("text-caption transition-colors duration-300 link-underline text-left", navTone)}
                    type="button"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <NavItem to="/login" variant={resolvedVariant}>
                  Sign In
                </NavItem>
              )}
            </div>
          </>
        )}
      </div>
    </motion.header>
  );
};

interface NavItemProps {
  to: string;
  children: React.ReactNode;
  variant: "default" | "transparent" | "minimal";
}

const NavItem = ({ to, children, variant }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "text-caption transition-colors duration-300 link-underline",
        variant === "transparent" || variant === "minimal"
          ? isActive ? "text-white" : "text-white/70 hover:text-white"
          : isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
};

export default Header;
