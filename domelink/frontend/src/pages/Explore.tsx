import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import Reveal, { StaggerContainer, StaggerItem } from "@/components/animations/Reveal";
import PageTransition from "@/components/layout/PageTransition";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import { api, type Architect } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Explore = () => {
  const queryClient = useQueryClient();
  const track = useAnalytics();

  // 1. The Live Input State (what the user sees in the text boxes)
  const [inputs, setInputs] = useState({
    minRating: 0,
    minBudget: 0,
    maxBudget: 100000,
    preferredStyle: "",
    location: "",
    plotSize: "",
  });

  // 2. The Applied State (what actually triggers the API fetch)
  const [appliedFilters, setAppliedFilters] = useState(inputs);

  // 3. React Query now LISTENS ONLY to appliedFilters
  const { data: filteredArchitects = [], isLoading } = useQuery({
    queryKey: queryKeys.architects({ 
      minRating: appliedFilters.minRating, 
      minBudget: appliedFilters.minBudget, 
      maxBudget: appliedFilters.maxBudget 
    }),
    queryFn: () =>
      api.getArchitects({
        minRating: appliedFilters.minRating || undefined,
        minBudget: appliedFilters.minBudget || undefined,
        maxBudget: appliedFilters.maxBudget || undefined,
      }),
  });

  const { data: recommendationsPayload } = useQuery({
    queryKey: ["recommendations", appliedFilters.minBudget, appliedFilters.maxBudget, appliedFilters.preferredStyle, appliedFilters.location, appliedFilters.plotSize],
    queryFn: () =>
      api.getHomeownerRecommendations({
        budgetMin: appliedFilters.minBudget || undefined,
        budgetMax: appliedFilters.maxBudget || undefined,
        style: appliedFilters.preferredStyle || undefined,
        location: appliedFilters.location || undefined,
        plotSize: appliedFilters.plotSize || undefined,
      }),
  });

  const recommendations = recommendationsPayload?.recommendations ?? [];

  const { data: savedArchitects = [] } = useQuery({
    queryKey: queryKeys.savedArchitects(),
    queryFn: api.getSavedArchitects,
    enabled: Boolean(localStorage.getItem("domelink_token")),
  });

  const saveMutation = useMutation({
    mutationFn: (architectId: string) => api.saveArchitect(architectId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.savedArchitects() });
      track("save", { action: "save" });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: (architectId: string) => api.unsaveArchitect(architectId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.savedArchitects() });
      track("save", { action: "unsave" });
    },
  });

  // Analytics only fires when the user hits search
  useEffect(() => {
    track("search_filter", appliedFilters);
  }, [appliedFilters, track]);

  // Handlers for Input and Buttons
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: type === 'number' || type === 'range' ? Number(value) : value
    }));
  };

  const handleSearch = () => {
    setAppliedFilters(inputs); // This triggers the network request!
  };

  const handleClear = () => {
    const defaultState = {
      minRating: 0,
      minBudget: 0,
      maxBudget: 100000,
      preferredStyle: "",
      location: "",
      plotSize: "",
    };
    setInputs(defaultState);
    setAppliedFilters(defaultState); // Resets the UI and the Search
  };

  return (
    <PageTransition>
      <Header variant="default" />
      <main>
        <DomeHero
          kicker="Discover"
          title="Find the architect who understands your vision"
          subtitle="Filter by specialty, location, rating, and budget to match with a verified studio."
          imageUrl="https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1920&q=80"
          align="left"
          className="pt-20"
        />

        {/* Filters */}
        <Section padding="none" className="pb-12">
          <Container>
            <Reveal delay={0.2}>
              <div className="dome-flow pt-6 flex flex-wrap gap-8 items-end">
                <FilterGroup label="Minimum Rating">
                  <input
                    type="range"
                    name="minRating"
                    min="0"
                    max="5"
                    step="0.5"
                    value={inputs.minRating}
                    onChange={handleInputChange}
                    className="w-32 accent-foreground"
                  />
                  <span className="text-body-sm text-muted-foreground ml-2">
                    {inputs.minRating > 0 ? `${inputs.minRating}+` : "Any"}
                  </span>
                </FilterGroup>

                <FilterGroup label="Budget Range">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="minBudget"
                      placeholder="Min"
                      value={inputs.minBudget || ""}
                      onChange={handleInputChange}
                      className="w-28 dome-input"
                    />
                    <span className="text-muted-foreground">—</span>
                    <input
                      type="number"
                      name="maxBudget"
                      placeholder="Max"
                      value={inputs.maxBudget === 100000 ? "" : inputs.maxBudget}
                      onChange={handleInputChange}
                      className="w-28 dome-input"
                    />
                  </div>
                </FilterGroup>

                <FilterGroup label="Preferred Style">
                  <input
                    type="text"
                    name="preferredStyle"
                    placeholder="Minimal, Modern, Coastal"
                    value={inputs.preferredStyle}
                    onChange={handleInputChange}
                    className="w-48 dome-input"
                  />
                </FilterGroup>

                <FilterGroup label="Location">
                  <input
                    type="text"
                    name="location"
                    placeholder="City, Country"
                    value={inputs.location}
                    onChange={handleInputChange}
                    className="w-48 dome-input"
                  />
                </FilterGroup>

                <div className="flex items-center gap-4">
                  <button onClick={handleSearch} className="dome-button">
                    Apply Filters
                  </button>
                  <button onClick={handleClear} className="dome-button-outline">
                    Clear
                  </button>
                </div>
              </div>
            </Reveal>
          </Container>
        </Section>

        {/* Architect List */}
        {/* Architect List */}
        <Section padding="small">
          <Container>
            {recommendations.length > 0 && (
              <div className="mb-12">
                <Reveal>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-display-sm">Recommended for you</h2>
                    <span className="text-caption text-muted-foreground">Based on your preferences</span>
                  </div>
                </Reveal>
                <StaggerContainer className="space-y-0">
                  {recommendations.filter(a => a && a.slug).map((architect, index) => (
                    <StaggerItem key={architect._id || index}>
                      <ArchitectRow
                        architect={architect}
                        index={index}
                        savedArchitects={savedArchitects}
                        onSave={saveMutation.mutate}
                        onUnsave={unsaveMutation.mutate}
                      />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            )}
            <StaggerContainer className="space-y-0">
              {isLoading && (
                <Reveal>
                  <div className="space-y-6 py-8">
                    <ArchitectRowSkeleton />
                    <ArchitectRowSkeleton />
                  </div>
                </Reveal>
              )}
              {filteredArchitects.filter(a => a && a.slug).map((architect, index) => (
                <StaggerItem key={architect._id || index}>
                  <ArchitectRow
                    architect={architect}
                    index={index}
                    savedArchitects={savedArchitects}
                    onSave={saveMutation.mutate}
                    onUnsave={unsaveMutation.mutate}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>

            {!isLoading && filteredArchitects.length === 0 && (
              <Reveal>
                <div className="text-center py-24">
                  <p className="text-display-sm text-muted-foreground">
                    No architects match your criteria
                  </p>
                  <button onClick={handleClear} className="mt-4 text-caption link-underline">
                    Clear all filters
                  </button>
                </div>
              </Reveal>
            )}
          </Container>
        </Section>
        <DomeCTA />
      </main>
      <Footer />
    </PageTransition>
  );
};

const FilterGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-2">
    <span className="text-caption text-muted-foreground">{label}</span>
    <div className="flex items-center">{children}</div>
  </div>
);

interface ArchitectRowProps {
  architect: Architect;
  index: number;
  savedArchitects?: Architect[];
  onSave?: (id: string) => void;
  onUnsave?: (id: string) => void;
}

const ArchitectRow = ({ architect, index, savedArchitects = [], onSave, onUnsave }: ArchitectRowProps) => {
  const isSaved = useMemo(() => savedArchitects.filter(item => item && item._id).some((item) => item._id === architect._id), [savedArchitects, architect._id]);
  if (!architect || !architect.slug) return null;
  return (
    <Link to={`/architect/${architect.slug}`}>
      <motion.article
        className="group grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 py-10 border-b border-border/40 cursor-pointer"
        whileHover={{ x: 10 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Image */}
        <div className="lg:col-span-5 image-zoom aspect-[4/3] lg:aspect-[16/10]">
          <img
            src={architect.heroImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"}
            alt={architect.name}
            className="w-full h-full object-cover rounded-xl"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-display-md group-hover:text-muted-foreground transition-colors duration-300">
                {architect.name}
              </h2>
              <p className="text-body text-muted-foreground mt-1">
                {architect.location || "Location not set"}
              </p>
            </div>
            <div className="text-right">
              <span className="text-caption text-muted-foreground block">Rating</span>
              <span className="text-display-sm">{architect.rating || "New"}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (isSaved) {
                onUnsave?.(architect._id);
              } else {
                onSave?.(architect._id);
              }
            }}
            className="inline-flex items-center gap-2 text-caption text-muted-foreground hover:text-foreground transition-colors"
          >
            <motion.span whileTap={{ scale: 0.9 }}>
              <Heart className={isSaved ? "fill-foreground text-foreground" : "text-muted-foreground"} size={16} />
            </motion.span>
            {isSaved ? "Saved" : "Save"}
          </button>

          <p className="text-body text-muted-foreground mb-6 max-w-xl line-clamp-2">
            {architect.specialty || architect.about || "No details provided."}
          </p>

          <div className="flex items-center gap-8">
            <div>
              <span className="text-caption text-muted-foreground block">Starting From</span>
              <span className="text-body-lg font-medium">
                ${(architect.startingPrice || 0).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-caption text-muted-foreground block">Experience</span>
              <span className="text-body">{architect.experience || "N/A"}</span>
            </div>
            <div>
              <span className="text-caption text-muted-foreground block">Team</span>
              <span className="text-body">{architect.teamSize || 1} people</span>
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
};

const ArchitectRowSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 py-10 border-b border-border/40">
    <Skeleton className="lg:col-span-5 aspect-[4/3] lg:aspect-[16/10] rounded-2xl" />
    <div className="lg:col-span-7 space-y-4">
      <Skeleton className="h-7 w-2/5" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-4">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-28" />
      </div>
    </div>
  </div>
);

export default Explore;