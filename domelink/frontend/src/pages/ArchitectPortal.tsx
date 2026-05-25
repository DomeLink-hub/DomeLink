import { useMemo } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section, Grid } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
import Reveal from "@/components/animations/Reveal";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import StudioScene from "@/components/3d/StudioScene";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const ArchitectPortal = () => {
  const navigate = useNavigate();
  const { data: stats } = useQuery({
    queryKey: queryKeys.architectStats(),
    queryFn: api.getMyArchitectStats,
  });
  const { data: consultations = [] } = useQuery({
    queryKey: queryKeys.consultations(),
    queryFn: api.getConsultations,
  });

  const throughputData = useMemo(
    () => [
      { label: "Mon", value: (stats?.pendingRequests ?? 0) + 4 },
      { label: "Tue", value: (stats?.pendingRequests ?? 0) + 6 },
      { label: "Wed", value: (stats?.pendingRequests ?? 0) + 3 },
      { label: "Thu", value: (stats?.pendingRequests ?? 0) + 8 },
      { label: "Fri", value: (stats?.pendingRequests ?? 0) + 5 },
    ],
    [stats?.pendingRequests],
  );

  const handleLogout = async () => {
    api.clearToken();
    navigate("/login?role=architect", { replace: true });
  };

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Architect Console"
          title="Architect Portal"
          subtitle="Manage your active conversations, templates, and collaboration workspace."
          imageUrl="https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1920&q=80"
          align="left"
          className="pt-20"
        />
        <Section padding="none" className="-mt-16">
          <Container>
            <div className="flex justify-end">
              <motion.button
                className="dome-button-outline"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
              >
                Logout
              </motion.button>
            </div>
          </Container>
        </Section>

        <Section padding="small">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 mb-10">
              <div className="dome-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-display-sm">Studio Preview</h3>
                  <span className="text-caption text-muted-foreground">Live model</span>
                </div>
                <StudioScene className="h-64 w-full" />
              </div>
              <div className="dome-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-display-sm">Request Throughput</h3>
                  <span className="text-caption text-muted-foreground">This week</span>
                </div>
                <ChartContainer
                  config={{
                    value: { label: "Requests", color: "hsl(var(--primary))" },
                  }}
                  className="h-48"
                >
                  <AreaChart data={throughputData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.2} />
                  </AreaChart>
                </ChartContainer>
              </div>
            </div>
            <Grid cols={3} gap="large">
              <div className="dome-panel p-6">
                <h3 className="text-display-sm mb-6">Overview</h3>
                <ul className="space-y-4 text-body-sm text-muted-foreground">
                  <li>Total Requests: {stats?.totalRequests ?? 0}</li>
                  <li>Pending: {stats?.pendingRequests ?? 0}</li>
                  <li>Accepted: {stats?.acceptedRequests ?? 0}</li>
                  <li>Monthly Earnings: ${(stats?.monthlyEarnings ?? 0).toLocaleString()}</li>
                </ul>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="flex gap-3 text-body-sm text-muted-foreground">
                  <span className="dome-chip">Requests</span>
                  <span className="dome-chip">Messages</span>
                  <span className="dome-chip">Workspace</span>
                </div>

                <div className="dome-panel">
                  <div className="px-6 py-4 border-b border-border/60">
                    <h3 className="text-display-sm">Latest Requests</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {consultations.slice(0, 4).map((consultation) => (
                      <div key={consultation._id} className="rounded-xl border border-border p-4">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-body font-medium">{consultation.userId.name}</p>
                          <span className="dome-chip">{consultation.status}</span>
                        </div>
                        <p className="text-body-sm text-muted-foreground mt-2 line-clamp-2">{consultation.message}</p>
                      </div>
                    ))}
                    {consultations.length === 0 ? (
                      <p className="text-body-sm text-muted-foreground">No requests yet.</p>
                    ) : null}
                    <div className="pt-2">
                      <Link to="/architect/dashboard" className="text-caption link-underline">
                        Open full dashboard
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Grid>
          </Container>
        </Section>
        <DomeCTA />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default ArchitectPortal;
