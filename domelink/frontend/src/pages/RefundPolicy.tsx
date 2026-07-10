import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";

const RefundPolicy = () => {
  return (
    <PageTransition>
      <Header />
      <main className="pt-32 pb-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <span className="text-caption text-primary mb-4 block">Legal</span>
            <h1 className="text-display-md text-foreground mb-8">Refund Policy</h1>
            <p className="text-body text-muted-foreground mb-12">Last updated: July 2026</p>
            
            <div className="space-y-8 text-body text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-display-sm text-foreground mb-4">1. Overview</h2>
                <p>
                  DomeLink is committed to a transparent and fair marketplace environment. This policy governs how consultation fees paid by homeowners (clients) may be refunded.
                </p>
              </section>

              <section>
                <h2 className="text-display-sm text-foreground mb-4">2. Consultation Fees</h2>
                <p>
                  The consultation fee is an engagement payment made to connect with an architect through DomeLink. We currently review all refund requests manually, on a case-by-case basis, taking into account factors such as whether the architect had accepted the consultation, whether communication had begun, and the circumstances of the request. We do not currently guarantee automatic or tiered refund percentages.
                </p>
              </section>

              <section>
                <h2 className="text-display-sm text-foreground mb-4">3. Project Milestones</h2>
                <p>
                  Larger project phases and architectural deliverables agreed privately between an architect and client, outside DomeLink's consultation fee, are governed by whatever agreement the two parties reach directly. DomeLink does not intermediate, warrant, or process refunds for work, deliverables, or disputes arising from those private arrangements.
                </p>
              </section>

              <section>
                <h2 className="text-display-sm text-foreground mb-4">4. Requesting a Refund</h2>
                <p>
                  To request a refund, email our support team at <a href="mailto:support@domelink.in" className="text-foreground underline hover:text-primary">support@domelink.in</a> with your consultation details and the reason for your request. We aim to respond within 3-5 business days.
                </p>
              </section>

              <section>
                <h2 className="text-display-sm text-foreground mb-4">5. Processing Timeframes</h2>
                <p>
                  If a refund is approved, it is processed back to your original payment method via Razorpay. Bank and card clearing timelines typically range from 5 to 7 business days once initiated.
                </p>
              </section>

              <section>
                <h2 className="text-display-sm text-foreground mb-4">6. Contact</h2>
                <p>
                  For refund requests or billing questions, contact: <a href="mailto:support@domelink.in" className="text-foreground underline hover:text-primary">support@domelink.in</a>
                </p>
              </section>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default RefundPolicy;
