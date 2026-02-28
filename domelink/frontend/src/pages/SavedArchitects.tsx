import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section, Grid } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import Reveal from "@/components/animations/Reveal";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const SavedArchitects = () => {
  const { data: savedArchitects = [], isLoading } = useQuery({
    queryKey: queryKeys.savedArchitects(),
    queryFn: api.getSavedArchitects,
  });

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Saved"
          title="Your Saved Architects"
          subtitle="A refined shortlist of studios you want to revisit."
          imageUrl="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1920&q=80"
          align="left"
          className="pt-20"
        />
        <Section padding="small" className="pb-32">
          <Container>
            {isLoading ? (
              <div className="text-center text-muted-foreground py-12">Loading saved architects...</div>
            ) : savedArchitects.length === 0 ? (
              <div className="dome-panel p-12 text-center">
                <p className="text-body text-muted-foreground mb-4">No saved architects yet.</p>
                <Link to="/explore" className="text-caption link-underline">
                  Explore architects
                </Link>
              </div>
            ) : (
              <Grid cols={3} gap="default">
                {savedArchitects.filter(a => a && a.slug).map((architect, index) => (
                  <Reveal key={architect._id || index} delay={index * 0.1}>
                    <Link to={`/architect/${architect.slug}`}>
                      <div className="dome-card p-4 group">
                        <div className="image-zoom aspect-[4/3] mb-4 rounded-2xl overflow-hidden">
                          <img
                            src={architect.heroImage}
                            alt={architect.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <h3 className="text-body font-medium group-hover:text-muted-foreground transition-colors">
                          {architect.name}
                        </h3>
                        <p className="text-body-sm text-muted-foreground">{architect.specialty}</p>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </Grid>
            )}
          </Container>
        </Section>
        <DomeCTA />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default SavedArchitects;
