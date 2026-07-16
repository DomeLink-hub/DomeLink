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
            <h1 className="text-display-md text-foreground mb-8">Refund & Cancellation Policy</h1>
            <p className="text-body text-muted-foreground mb-12">Last updated: July 2026</p>
            
            <div className="space-y-8 text-body text-muted-foreground leading-relaxed">
              <section>
                <p className="mb-6">
                  We are committed to providing all the services and facilities included in your selected plan.
                </p>
                <h2 className="text-display-sm text-foreground mb-4">Cancellation & Refund</h2>
                <ul className="list-disc pl-6 space-y-4 mb-8">
                  <li>You may cancel your purchase within 7 days from the date of payment.</li>
                  <li>If you cancel within the first 3 days, you will receive a 90% refund of the amount paid. The remaining 10% will be deducted towards payment processing and administrative charges.</li>
                  <li>If you cancel from Day 4 to Day 6, you will be eligible for a 50% refund of the amount paid.</li>
                  <li>No refunds or cancellations will be accepted after 7 days from the date of payment.</li>
                  <li>Approved refunds will be processed to the original payment method within 7–10 business days.</li>
                </ul>
                <p>
                  By purchasing our services, you acknowledge that you have read and agreed to this Refund & Cancellation Policy.
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
