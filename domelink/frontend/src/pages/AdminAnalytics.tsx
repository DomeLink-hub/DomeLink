import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import Reveal from "@/components/animations/Reveal";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const AdminAnalytics = () => {
  const [days, setDays] = useState(30);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-analytics", days],
    queryFn: () => api.getAnalytics(days),
  });
  const { data: summary } = useQuery({
    queryKey: ["admin-analytics-summary"],
    queryFn: api.getAnalyticsSummary,
  });

  const eventLookup = summary?.byEvent.reduce<Record<string, number>>((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {}) || {};

  const trend7 = summary?.daily7.reduce((acc, day) => acc + day.count, 0) || 0;
  const trend30 = summary?.daily30.reduce((acc, day) => acc + day.count, 0) || 0;

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Admin"
          title="Analytics"
          subtitle="Signal collection across product journeys and user intent."
          imageUrl="https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1920&q=80"
          align="left"
          className="pt-20"
        />
        <Section padding="small" className="pb-32">
          <Container>
            <Reveal>
              <div className="flex items-center justify-end mb-4">
                <select
                  value={days}
                  onChange={(event) => setDays(Number(event.target.value))}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-body-sm"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Total events" value={summary?.totals ?? 0} loading={isLoading} />
                <StatCard title="Profile views" value={eventLookup.profile_view ?? 0} loading={isLoading} />
                <StatCard title="Consultation starts" value={eventLookup.consultation_start ?? 0} loading={isLoading} />
                <StatCard title="Saves" value={eventLookup.save ?? 0} loading={isLoading} />
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="dome-panel p-6">
                  <h3 className="text-body font-medium mb-2">Last 7 days</h3>
                  <p className="text-display-sm">{trend7}</p>
                  <p className="text-body-sm text-muted-foreground">Tracked interactions</p>
                </div>
                <div className="dome-panel p-6">
                  <h3 className="text-body font-medium mb-2">Last 30 days</h3>
                  <p className="text-display-sm">{trend30}</p>
                  <p className="text-body-sm text-muted-foreground">Tracked interactions</p>
                </div>
              </div>
            </Reveal>

            {isLoading ? (
              <div className="dome-panel p-6 space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="dome-panel p-6">
                <div className="grid grid-cols-3 text-caption text-muted-foreground mb-4">
                  <span>Event</span>
                  <span>Metadata</span>
                  <span>Time</span>
                </div>
                <div className="space-y-3">
                  {events.map((event, index) => (
                    <Reveal key={`${event.event}-${index}`} delay={index * 0.02}>
                      <div className="grid grid-cols-3 gap-4 text-body-sm border-t border-border/40 pt-3">
                        <span className="text-foreground capitalize">{event.event.replace(/_/g, " ")}</span>
                        <span className="text-muted-foreground">
                          {event.metadata ? JSON.stringify(event.metadata) : "—"}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(event.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}
          </Container>
        </Section>
        <DomeCTA />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default AdminAnalytics;

const StatCard = ({ title, value, loading }: { title: string; value: number; loading: boolean }) => (
  <div className="dome-panel p-6">
    <p className="text-caption text-muted-foreground mb-2">{title}</p>
    {loading ? <Skeleton className="h-8 w-20" /> : <p className="text-display-sm">{value.toLocaleString()}</p>}
  </div>
);
