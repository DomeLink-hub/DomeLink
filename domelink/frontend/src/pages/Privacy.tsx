import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";

const Privacy = () => {
  return (
    <PageTransition>
      <Header />
      <main className="pt-32 pb-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <span className="text-caption text-primary mb-4 block">Legal</span>
            <h1 className="text-display-md text-foreground mb-8">Privacy Policy</h1>
            <p className="text-body text-muted-foreground mb-12">Last updated: July 2026</p>
            
            <div className="space-y-8 text-body text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-display-sm text-foreground mb-4">1. Introduction</h2>
                <p>
                  DomeLink values your privacy. This Privacy Policy outlines our practices regarding the collection, use, and disclosure of your information when you use our web platform. We comply with the fundamental structure established under the Digital Personal Data Protection (DPDP) Act 2023 of India.
                </p>
              </section>

              <section>
                <h2 className="text-display-sm text-foreground mb-4">2. Data We Collect</h2>
                <p className="mb-4">We collect information that you provide directly to us through forms and interactions on the platform:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Account Data:</strong> Name, email address, phone number, and location context.</li>
                  <li><strong>Professional Data (Architects):</strong> Firm name, COA registration number, portfolio images, pricing, and specialized design services.</li>
                  <li><strong>Project Data (Clients):</strong> Scope, timeline, estimated budgets, site locations, plot sizing, and stylistic inclinations.</li>
                  <li><strong>Financial Data:</strong> Payments processed securely via integration with Razorpay (we do not independently store your raw credit card data).</li>
                </ul>
              </section>

              <section>
                <h2 className="text-display-sm text-foreground mb-4">3. How We Use Your Data</h2>
                <p>
                  Your information is utilized solely to facilitate the core purpose of the platform: matching clients with architects. We use project scopes to generate recommendations, compute analytical dashboards, facilitate direct encrypted real-time chat between stakeholders, and trigger necessary platform notifications.
                </p>
              </section>

              <section>
                <h2 className="text-display-sm text-foreground mb-4">4. Third-Party Integrations</h2>
                <p className="mb-4">To deliver our premium experience, real user data passes through vetted third-party services:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Razorpay:</strong> Handles all transactional payment workflows and identity limits.</li>
                  <li><strong>Resend:</strong> Manages critical transactional communications, authentication magic links, and email receipts.</li>
                  <li><strong>Cloudinary:</strong> Stores and delivers rich digital assets (portfolio images, reference documents) uploaded by users.</li>
                  <li><strong>Groq AI:</strong> Powers the Avora smart estimate and search architecture logic anonymously processing raw prompt inputs.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-display-sm text-foreground mb-4">5. User Rights & Data Retention</h2>
                <p>
                  Under DPDP Act 2023 compliance, you retain absolute authority to request a copy of your personal data or mandate its permanent deletion from our PostgreSQL and MongoDB clusters. Data is retained only as long as your account remains active or as required by Indian legal accounting statues (e.g., transactional invoices via Razorpay).
                </p>
              </section>

              <section>
                <h2 className="text-display-sm text-foreground mb-4">6. Cookies & Tracking</h2>
                <p>
                  DomeLink uses essential functional cookies designed to securely preserve your JWT authentication tokens (httpOnly) ensuring you remain logged in securely across active sessions. We do not currently broadcast analytic activity to non-essential third-party advertising networks.
                </p>
              </section>

              <section>
                <h2 className="text-display-sm text-foreground mb-4">7. Consent & Grievance Contact</h2>
                <p>
                  By creating an account and logging onto DomeLink, you consent to the storage and routing mechanisms described herein. If you have concerns, our Grievance Officer can be directly contacted at the following proxy address:
                  <br /><br />
                  <strong>Email:</strong> privacy@domelink.in<br />
                  <strong>Response window:</strong> 72 hours.
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

export default Privacy;
