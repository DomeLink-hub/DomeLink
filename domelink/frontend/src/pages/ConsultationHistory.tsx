import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import Reveal from "@/components/animations/Reveal";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const ConsultationHistory = () => {
  const { data: consultations = [], isLoading } = useQuery({
    queryKey: queryKeys.consultations(),
    queryFn: api.getConsultations,
  });

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="History"
          title="Consultation History"
          subtitle="Review your past and active consultations with verified architects."
          imageUrl="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80"
          align="left"
          className="pt-20"
        />
        <Section padding="small" className="pb-32">
          <Container size="narrow">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-12">Loading consultations...</div>
            ) : (
              <div className="space-y-4">
                {consultations.map((consultation, index) => (
                  <Reveal key={consultation._id} delay={index * 0.05}>
                    <div className="dome-card p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-body font-medium">{consultation.architectId.name}</h3>
                        <span className="dome-chip">{consultation.status}</span>
                      </div>
                      <p className="text-body-sm text-muted-foreground mb-2">{consultation.message}</p>
                      <p className="text-caption text-muted-foreground">
                        {new Date(consultation.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </Reveal>
                ))}
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

export default ConsultationHistory;
