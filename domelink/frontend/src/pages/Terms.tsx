import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";

const Terms = () => {
  return (
    <PageTransition>
      <Header />
      <main className="pt-32 pb-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <span className="text-caption text-primary mb-4 block">Legal</span>
            <h1 className="text-display-md text-foreground mb-8">Terms of Service</h1>
            <p className="text-body text-muted-foreground mb-12">Last updated: July 2026</p>
            
            <div className="space-y-8 text-body text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-display-sm text-foreground mb-4">1. Information About DomeLink</h2>
                <p>
                  DomeLink operates strictly as a marketplace platform connecting homeowners with registered architectural professionals. DomeLink itself is not an architecture firm, does not provide architectural or engineering services, and does not act as a general contractor. Our platform facilitates connection, consultation, and payment escrow between independent parties.
                </p>
              </section>

              <section>
                <h2 className="text-display-sm text-foreground mb-4">2. User Responsibilities</h2>
                <p className="mb-4">
                  <strong>For Homeowners (Clients):</strong> You agree to provide accurate project details, budgets, and property information. You are solely responsible for ensuring you have the legal right to commission architectural work on the specified property.
                </p>
                <p>
                  <strong>For Architects:</strong> You agree to represent your professional qualifications accurately. You must independently ensure compliance with all local laws and the Architects Act, 1972 (India). You must clearly communicate deliverables, timelines, and fees natively through our platform.
                </p>
              </section>

              <section>
                <h2 className="text-display-sm text-foreground mb-4">3. Architect Verification Disclaimer</h2>
                <p>
                  While DomeLink collects Council of Architecture (COA) registration numbers during architect onboarding to encourage professional transparency, <strong>this verification relies on self-reported data and is currently maintained as a stored field.</strong> We do not conduct continuous manual audits of COA validity. Clients are strongly encouraged to independently verify an architect's credentials before entering into a significant contract.
                </p>
              </section>

              <section>
                <h2 className="text-display-sm text-foreground mb-4">4. Consultations & Payments</h2>
                <p>
                  DomeLink's "Consultation" feature leverages third-party payment gateways (Razorpay) to secure consultation fees. When a client initiates a consultation, the fee is handled in accordance with the payment gateway's structural terms. DomeLink relies on internal workflows to transition statuses (Pending, Accepted, In Progress), but we do not guarantee the subjective quality of the consultation outcome itself.
                </p>
              </section>

              <section>
                <h2 className="text-display-sm text-foreground mb-4">5. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by applicable law, DomeLink and its founders shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues (whether incurred directly or indirectly), or any loss of data, use, goodwill, or other intangible losses resulting from any contractual or structural failure between matched users.
                </p>
              </section>

              <section>
                <h2 className="text-display-sm text-foreground mb-4">6. Prohibited Conduct</h2>
                <p>
                  Users may not use DomeLink to: transmit malware, infringe on intellectual property, attempt to bypass platform escrow features for Consultation fees, harass other users, or submit materially false information during onboarding.
                </p>
              </section>

              <section>
                <h2 className="text-display-sm text-foreground mb-4">7. Termination</h2>
                <p>
                  We reserve the right to suspend or terminate your access to the platform at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
                </p>
              </section>

              <section>
                <h2 className="text-display-sm text-foreground mb-4">8. Governing Law & Dispute Resolution</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of India. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Bengaluru, Karnataka, India.
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

export default Terms;
