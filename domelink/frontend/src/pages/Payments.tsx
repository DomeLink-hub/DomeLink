
import { useEffect, useState } from "react";
import { Container, Section } from "@/components/layout/Layout";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { api, type Payment, type Invoice } from "@/lib/api";
import { frontendEnv } from "@/lib/env";

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getPayments()
      .then(setPayments)
      .catch(() => setError("Failed to load payments."))
      .finally(() => setLoading(false));

    api.getInvoices().then(setInvoices).catch(() => {
      // ignore invoice errors for now
    });
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
            {payments.map((p) => {
              const id = p.id || p._id || String(p.amount) + p.createdAt;
              const statusLabel =
                p.status === "PAID" || p.status === "completed" ? "Completed" : p.status;
              const planName =
                (p.metadata as { planName?: string } | undefined)?.planName ||
                (p.metadata as { planId?: string } | undefined)?.planId;
              return (
              <div key={id} className="dome-card p-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-semibold">
                    {p.amount.toLocaleString("en-IN", { style: "currency", currency: p.currency || "INR", maximumFractionDigits: 0 })}
                  </span>
                  <span className={`dome-chip ${statusLabel === "Completed" ? "bg-green-200" : "bg-yellow-200"}`}>{statusLabel}</span>
                  {p.method && <span className="dome-chip">{p.method}</span>}
                  {planName && <span className="dome-chip">{planName}</span>}
                  <span className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</span>
                </div>
                {p.purpose && <p className="text-body-sm text-muted-foreground capitalize">{p.purpose}</p>}
              </div>
            );})}
            {invoices.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Invoices</h2>
                <div className="space-y-2">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="dome-card p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{inv.invoiceNumber}</div>
                        <div className="text-sm text-muted-foreground">Issued: {new Date(inv.issuedAt).toLocaleDateString()}</div>
                      </div>
                      <div>
                        {inv.pdfUrl ? (
                          <a href={`${frontendEnv.VITE_API_BASE_URL}${inv.pdfUrl}`} className="btn btn-sm" target="_blank" rel="noreferrer">Download PDF</a>
                        ) : (
                          <span className="text-sm text-muted-foreground">PDF unavailable</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Container>
      </Section>
      <Footer />
    </PageTransition>
  );
}
