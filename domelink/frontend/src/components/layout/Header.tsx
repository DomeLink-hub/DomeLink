import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/useAuthContext";

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

  const variantClasses = {
    default: "bg-transparent absolute top-0 left-0 right-0 z-50",
    transparent: "bg-transparent absolute top-0 left-0 right-0 z-50",
    minimal: "bg-transparent absolute top-0 left-0 right-0 z-50",
  };

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
        {/* Mobile menu toggle */}
        <div className="md:hidden flex justify-end mb-2">
          <button id="nav-toggle" className="dome-button px-3 py-2 text-lg">☰</button>
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
            <nav className="hidden md:flex flex-nowrap items-center gap-8 w-full md:w-auto mt-0 animate-fade-in">
              {/* Desktop nav */}
              <NavItem to="/find-architects" variant={resolvedVariant}>
                Find Architects
              </NavItem>
              <NavItem to="/how-it-works" variant={resolvedVariant}>
                How it Works
              </NavItem>
              <NavItem to="/about" variant={resolvedVariant}>
                About
              </NavItem>
              {user ? (
                <>
                  <NavItem to={roleHome(user.role)} variant={resolvedVariant}>
                    Dashboard
                  </NavItem>
                  <NavItem to="/notifications" variant={resolvedVariant}>
                    Notifications
                  </NavItem>
                  <NavItem to="/reviews" variant={resolvedVariant}>
                    Reviews
                  </NavItem>
                  <NavItem to="/payments" variant={resolvedVariant}>
                    Payments
                  </NavItem>
                  <NavItem to="/files" variant={resolvedVariant}>
                    Files
                  </NavItem>
                  <NavItem to="/blog" variant={resolvedVariant}>
                    Blog
                  </NavItem>
                  <NavItem to="/support" variant={resolvedVariant}>
                    Support
                  </NavItem>
                  <NavItem to="/faq" variant={resolvedVariant}>
                    FAQ
                  </NavItem>
                  <NavItem to="/demo-dashboard" variant={resolvedVariant}>
                    Demo Dashboard
                  </NavItem>
                  <button
                    onClick={() => {
                      void logout();
                    }}
                    className={cn(
                      "text-caption transition-colors duration-300 link-underline",
                      resolvedVariant === "transparent" || resolvedVariant === "minimal"
                        ? "text-white/70 hover:text-white"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Logout
                  </button>
                  <NavItem to="/login" variant={resolvedVariant}>
                    Switch Account
                  </NavItem>
                </>
              ) : (
                <NavItem to="/login" variant={resolvedVariant}>
                  Sign In
                </NavItem>
              )}
            </nav>
            {/* Mobile dropdown nav */}
            <div id="nav-dropdown" className="md:hidden flex flex-col gap-2 bg-background rounded shadow-lg p-4 mt-2 animate-fade-in" style={{ display: 'none' }}>
              <NavItem to="/find-architects" variant={resolvedVariant}>Find Architects</NavItem>
              <NavItem to="/how-it-works" variant={resolvedVariant}>How it Works</NavItem>
              <NavItem to="/about" variant={resolvedVariant}>About</NavItem>
              {user ? <>
                <NavItem to={roleHome(user.role)} variant={resolvedVariant}>Dashboard</NavItem>
                <NavItem to="/notifications" variant={resolvedVariant}>Notifications</NavItem>
                <NavItem to="/reviews" variant={resolvedVariant}>Reviews</NavItem>
                <NavItem to="/payments" variant={resolvedVariant}>Payments</NavItem>
                <NavItem to="/files" variant={resolvedVariant}>Files</NavItem>
                <NavItem to="/blog" variant={resolvedVariant}>Blog</NavItem>
                <NavItem to="/support" variant={resolvedVariant}>Support</NavItem>
                <NavItem to="/faq" variant={resolvedVariant}>FAQ</NavItem>
                <NavItem to="/demo-dashboard" variant={resolvedVariant}>Demo Dashboard</NavItem>
                <button onClick={() => { void logout(); }} className={cn("text-caption transition-colors duration-300 link-underline", resolvedVariant === "transparent" || resolvedVariant === "minimal" ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground")}>Logout</button>
                <NavItem to="/login" variant={resolvedVariant}>Switch Account</NavItem>
              </> : <NavItem to="/login" variant={resolvedVariant}>Sign In</NavItem>}
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
