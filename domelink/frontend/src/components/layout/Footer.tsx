import { Link } from "react-router-dom";
import { Suspense } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Container } from "./Layout";
import LoaderScene3D from "@/components/3d/LoaderScene3D";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const Footer = () => {
  const activityData = [
    { week: "W1", visits: 280, matches: 34 },
    { week: "W2", visits: 420, matches: 52 },
    { week: "W3", visits: 510, matches: 61 },
    { week: "W4", visits: 640, matches: 78 },
  ];

  return (
    <footer className="border-t border-border/70 py-20 md:py-28">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 pb-16 border-b border-border/70">
          <div className="space-y-6">
            <span className="dome-kicker">Studio Lab</span>
            <h3 className="text-display-sm">Interactive platform snapshot</h3>
            <p className="text-body text-muted-foreground max-w-xl">
              Explore a living view of platform momentum, matching velocity, and the spatial design pipeline powering DomeLink.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="dome-card p-4">
                <p className="text-caption text-muted-foreground">Active briefs</p>
                <p className="text-display-sm mt-2">128</p>
              </div>
              <div className="dome-card p-4">
                <p className="text-caption text-muted-foreground">Live consults</p>
                <p className="text-display-sm mt-2">46</p>
              </div>
              <div className="dome-card p-4">
                <p className="text-caption text-muted-foreground">Architects online</p>
                <p className="text-display-sm mt-2">72</p>
              </div>
            </div>
          </div>
          <div className="grid gap-6">
            <div className="dome-card p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-caption text-muted-foreground">Weekly momentum</span>
                <span className="text-caption text-foreground">Demo</span>
              </div>
              <ChartContainer
                config={{
                  visits: { label: "Site visits", color: "hsl(var(--foreground))" },
                  matches: { label: "Matches", color: "hsl(var(--primary))" },
                }}
                className="h-40"
              >
                <AreaChart data={activityData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="visits" stroke="var(--color-visits)" fill="var(--color-visits)" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="matches" stroke="var(--color-matches)" fill="var(--color-matches)" fillOpacity={0.2} />
                </AreaChart>
              </ChartContainer>
            </div>
            <div className="dome-card p-6 flex items-center justify-between gap-6">
              <div>
                <p className="text-caption text-muted-foreground">3D model preview</p>
                <p className="text-body mt-2">Spin the latest concept massing in the collaborative lab.</p>
              </div>
              <Suspense fallback={<div className="h-24 w-24 rounded-full bg-muted animate-pulse" />}>
                <LoaderScene3D />
              </Suspense>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pt-16">
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
