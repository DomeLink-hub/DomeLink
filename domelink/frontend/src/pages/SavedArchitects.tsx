import { useMemo } from "react";
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
import ArchitectDiscoveryCard from "@/components/discovery/ArchitectDiscoveryCard";

const SavedArchitects = () => {
  const { data: savedArchitects = [], isLoading } = useQuery({
    queryKey: queryKeys.savedArchitects(),
    queryFn: api.getSavedArchitects,
  });

  const collections = useMemo(() => {
    const cityMap = new Map<string, number>();
    const styleMap = new Map<string, number>();

    savedArchitects.forEach((architect) => {
      const city = (architect.location || architect.citiesServed?.[0] || "General").split(",")[0].trim();
      const style = architect.designStyles?.[0] || architect.projectTypes?.[0] || architect.specialty || "General";
      cityMap.set(city, (cityMap.get(city) || 0) + 1);
      styleMap.set(style, (styleMap.get(style) || 0) + 1);
    });

    return [
      {
        title: "City shortlist",
        subtitle: "Architects grouped by the places you are actually planning in.",
        chips: Array.from(cityMap.entries()).slice(0, 3),
      },
      {
        title: "Style board",
        subtitle: "A moodboard-ready view of recurring design language.",
        chips: Array.from(styleMap.entries()).slice(0, 3),
      },
      {
        title: "Trust layer",
        subtitle: "Verified studios already in your saved stack.",
        chips: [
          ["Verified", savedArchitects.filter((architect) => architect.isVerified).length],
          ["Featured", savedArchitects.filter((architect) => architect.isFeatured).length],
          ["Reviewed", savedArchitects.reduce((total, architect) => total + (architect.reviewCount || 0), 0)],
        ] as Array<[string, number]>,
      },
    ];
  }, [savedArchitects]);

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {collections.map((collection) => (
                <div key={collection.title} className="dome-card p-5">
                  <div className="text-caption text-muted-foreground">Collection foundation</div>
                  <h3 className="mt-2 text-body-lg font-medium">{collection.title}</h3>
                  <p className="mt-2 text-body-sm text-muted-foreground">{collection.subtitle}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {collection.chips.map(([label, count]) => (
                      <span key={label} className="dome-chip">
                        {label} {typeof count === "number" ? `(${count})` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {isLoading ? (
              <div className="text-center text-muted-foreground py-12">Loading saved architects...</div>
            ) : savedArchitects.length === 0 ? (
              <div className="dome-panel p-12 text-center">
                <p className="text-body text-muted-foreground mb-4">No saved architects yet.</p>
                <p className="text-body-sm text-muted-foreground mb-6">
                  Your future collections will group architects by city, style, and trust signals.
                </p>
                <Link to="/explore" className="text-caption link-underline">
                  Explore architects
                </Link>
              </div>
            ) : (
              <Grid cols={3} gap="default">
                {savedArchitects.filter(a => a && a.slug).map((architect, index) => (
                  <Reveal key={architect._id || index} delay={index * 0.1}>
                    <ArchitectDiscoveryCard
                      architect={architect}
                      saved
                      compact
                    />
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
