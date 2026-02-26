
import { useEffect, useState } from "react";
import { Container, Section, Grid } from "@/components/layout/Layout";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { api, type AnalyticsSummary } from "@/lib/api";

export default function DemoDashboard() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getAnalyticsSummary()
      .then((summary: AnalyticsSummary) => {
        const mapped: Record<string, number> = {};
        summary.byEvent.forEach(ev => { mapped[ev._id] = ev.count; });
        setStats({
          projects: summary.totals,
          messages: mapped["consultation_start"] || 0,
          reviews: mapped["review"] || 0,
          payments: mapped["payment"] || 0,
          files: mapped["file"] || 0,
          notifications: mapped["notification"] || 0,
        });
      })
      .catch(() => setError("Failed to load dashboard stats."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <Header />
      <Section>
        <Container>
          <h1 className="text-3xl font-extrabold mb-6 flex items-center gap-3">
            <span className="animate-spin text-cyan-500">📊</span> Demo Dashboard
          </h1>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          <Grid cols={3} gap="default">
            <div className="dome-card p-6"><span className="text-caption">Projects</span><div className="text-2xl font-bold">{stats.projects ?? 0}</div></div>
            <div className="dome-card p-6"><span className="text-caption">Messages</span><div className="text-2xl font-bold">{stats.messages ?? 0}</div></div>
            <div className="dome-card p-6"><span className="text-caption">Reviews</span><div className="text-2xl font-bold">{stats.reviews ?? 0}</div></div>
            <div className="dome-card p-6"><span className="text-caption">Payments</span><div className="text-2xl font-bold">{stats.payments ?? 0}</div></div>
            <div className="dome-card p-6"><span className="text-caption">Files</span><div className="text-2xl font-bold">{stats.files ?? 0}</div></div>
            <div className="dome-card p-6"><span className="text-caption">Notifications</span><div className="text-2xl font-bold">{stats.notifications ?? 0}</div></div>
          </Grid>
        </Container>
      </Section>
      <Footer />
    </PageTransition>
  );
}
