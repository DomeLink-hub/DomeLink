import { Container, Section } from "@/components/layout/Layout";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";

const faqs = [
  { q: "How do I find an architect?", a: "Browse our verified architects and use filters to find the right match." },
  { q: "How do I start a project?", a: "Sign up, create a project brief, and invite architects to consult." },
  { q: "How do payments work?", a: "Payments are managed securely through our platform with multiple options." },
  { q: "How do I get support?", a: "Visit the Support page or open a ticket for help." },
];

export default function FAQ() {
  return (
    <PageTransition>
      <Header />
      <Section>
        <Container>
          <h1 className="text-2xl font-bold mb-6">Frequently Asked Questions</h1>
          <div className="space-y-6">
            {faqs.map((f, i) => (
              <div key={i} className="dome-card p-4">
                <h2 className="font-semibold mb-2">{f.q}</h2>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
      <Footer />
    </PageTransition>
  );
}
