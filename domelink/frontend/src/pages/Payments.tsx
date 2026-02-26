
import { useEffect, useState } from "react";
import { Container, Section } from "@/components/layout/Layout";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { api, type Payment } from "@/lib/api";

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getPayments()
      .then(setPayments)
      .catch(() => setError("Failed to load payments."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <Header />
      <Section>
        <Container>
          <h1 className="text-3xl font-extrabold mb-6 flex items-center gap-3">
            <span className="animate-spin text-green-500">💸</span> Payments
          </h1>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          <div className="space-y-4">
            {payments.length === 0 && !loading && <div className="dome-card p-4 text-center text-muted-foreground">No payments found. Your transactions will appear here!</div>}
            {payments.length === 0 && !loading && <div>No payments found.</div>}
            {payments.map((p) => (
              <div key={p._id} className="dome-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">${p.amount}</span>
                  <span className={`dome-chip ${p.status === "completed" ? "bg-green-200" : "bg-yellow-200"}`}>{p.status}</span>
                  <span className="dome-chip">{p.method}</span>
                  <span className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
      <Footer />
    </PageTransition>
  );
}
