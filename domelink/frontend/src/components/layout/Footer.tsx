import { Link } from "react-router-dom";
import { Container } from "./Layout";

const Footer = () => {
  return (
    <footer className="border-t border-border/70 py-20 md:py-28">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link to="/" className="font-display text-2xl uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="dome-orb" />
              DomeLink
            </Link>
            <p className="mt-5 text-body text-muted-foreground max-w-sm">
              A refined marketplace connecting homeowners with verified architects for
              spaces that feel intentional, calm, and enduring.
            </p>
          </div>

          <div>
            <h4 className="text-caption text-foreground mb-6">Platform</h4>
            <ul className="space-y-3">
              <FooterLink to="/find-architects">Explore Architects</FooterLink>
              <FooterLink to="/how-it-works">How it Works</FooterLink>
              <FooterLink to="/about">About</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="text-caption text-foreground mb-6">Account</h4>
            <ul className="space-y-3">
              <FooterLink to="/login">Sign In</FooterLink>
              <FooterLink to="/signup">Create Account</FooterLink>
              <FooterLink to="/client/dashboard">Dashboard</FooterLink>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/70 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-body-sm text-muted-foreground">
            © 2026 DomeLink. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-caption text-muted-foreground">Privacy</span>
            <span className="text-caption text-muted-foreground">Terms</span>
          </div>
        </div>
      </Container>
    </footer>
  );
};

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <li>
    <Link 
      to={to} 
      className="text-body-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
    >
      {children}
    </Link>
  </li>
);

export default Footer;
