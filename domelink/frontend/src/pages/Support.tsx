
import { useEffect, useState } from "react";
import { Container, Section } from "@/components/layout/Layout";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { api, type SupportTicket } from "@/lib/api";

export default function Support() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getSupportTickets()
      .then(setTickets)
      .catch(() => setError("Failed to load support tickets."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <Header />
      <Section>
        <Container>
          <h1 className="text-3xl font-extrabold mb-6 flex items-center gap-3">
            <span className="animate-bounce text-orange-500">🛠️</span> Support
          </h1>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          <div className="space-y-4">
            {tickets.length === 0 && !loading && <div className="dome-card p-4 text-center text-muted-foreground">No support tickets yet. Reach out for help anytime!</div>}
            {tickets.length === 0 && !loading && <div>No support tickets found.</div>}
            {tickets.map((t) => (
              <div key={t._id} className="dome-card p-4 flex items-center gap-4">
                <span className="font-semibold">{t.subject}</span>
                <span className={`dome-chip ${t.status === "open" ? "bg-green-200" : "bg-yellow-200"}`}>{t.status}</span>
                <span className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Container>
      </Section>
      <Footer />
    </PageTransition>
  );
}
