import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section, Grid } from "@/components/layout/Layout";
import Reveal from "@/components/animations/Reveal";
import PageTransition from "@/components/layout/PageTransition";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useAnalytics } from "@/hooks/useAnalytics";
import ArchitectDiscoveryCard from "@/components/discovery/ArchitectDiscoveryCard";
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
    city: "",
    projectType: "",
    verified: false,
    featured: false,
    sortBy: "relevance" as "relevance" | "rating" | "trust" | "response",
  });

  // 2. The Applied State (what actually triggers the API fetch)
  const [appliedFilters, setAppliedFilters] = useState(inputs);

  // Count active filters for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.minRating > 0) count++;
    if (appliedFilters.minBudget > 0 || appliedFilters.maxBudget < 100000) count++;
    if (appliedFilters.preferredStyle) count++;
    if (appliedFilters.city) count++;
    if (appliedFilters.projectType) count++;
    if (appliedFilters.verified) count++;
    if (appliedFilters.featured) count++;
    return count;
  }, [appliedFilters]);

  // 3. React Query now LISTENS ONLY to appliedFilters
  const { data: filteredArchitects = [], isLoading } = useQuery({
    queryKey: queryKeys.architects({ 
      minRating: appliedFilters.minRating, 
      minBudget: appliedFilters.minBudget, 
      maxBudget: appliedFilters.maxBudget,
      city: appliedFilters.city,
      style: appliedFilters.preferredStyle,
      projectType: appliedFilters.projectType,
      verified: appliedFilters.verified,
      featured: appliedFilters.featured,
    }),
    queryFn: () =>
      api.getArchitects({
        minRating: appliedFilters.minRating || undefined,
        minBudget: appliedFilters.minBudget || undefined,
        maxBudget: appliedFilters.maxBudget || undefined,
        city: appliedFilters.city || undefined,
        style: appliedFilters.preferredStyle || undefined,
        projectType: appliedFilters.projectType || undefined,
        verified: appliedFilters.verified || undefined,
        featured: appliedFilters.featured || undefined,
      }),
    staleTime: 0, // Force background refetch on every mount for fresh data
  });

  // Sort architects client-side based on sortBy
  const sortedArchitects = useMemo(() => {
    const arr = [...filteredArchitects];
    if (appliedFilters.sortBy === "rating") return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (appliedFilters.sortBy === "trust") return arr.sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
    if (appliedFilters.sortBy === "response") return arr.sort((a, b) => (a.consultationFee || 0) - (b.consultationFee || 0));
    
    // Sort by createdAt natively to always surface brand-new architects to homeowners
    return arr.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [filteredArchitects, appliedFilters.sortBy]);

  const { data: recommendationsPayload } = useQuery({
    queryKey: ["recommendations", appliedFilters.minBudget, appliedFilters.maxBudget, appliedFilters.preferredStyle, appliedFilters.location, appliedFilters.plotSize, appliedFilters.city, appliedFilters.projectType, appliedFilters.verified, appliedFilters.featured],
    queryFn: () =>
      api.getHomeownerRecommendations({
        budgetMin: appliedFilters.minBudget || undefined,
        budgetMax: appliedFilters.maxBudget || undefined,
        style: appliedFilters.preferredStyle || undefined,
        location: appliedFilters.location || undefined,
        plotSize: appliedFilters.plotSize || undefined,
        city: appliedFilters.city || undefined,
        projectType: appliedFilters.projectType || undefined,
        verified: appliedFilters.verified || undefined,
        featured: appliedFilters.featured || undefined,
      }),
    staleTime: 0,
  });

  const sortedRecommendations = useMemo(() => {
    const recs = recommendationsPayload?.recommendations ?? [];
    return [...recs].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [recommendationsPayload?.recommendations]);

  const { data: savedArchitects = [] } = useQuery({
    queryKey: queryKeys.savedArchitects(),
    queryFn: api.getSavedArchitects,
    enabled: Boolean(localStorage.getItem("domelink_token")),
  });

  const savedIds = useMemo(() => new Set(savedArchitects.map((architect) => architect._id)), [savedArchitects]);

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

  // Toggle helpers for chip filters
  const toggleStyle = (style: string) => {
    setInputs((prev) => ({
      ...prev,
      preferredStyle: prev.preferredStyle === style ? "" : style,
    }));
  };

  const toggleCity = (city: string) => {
    setInputs((prev) => ({
      ...prev,
      city: prev.city === city ? "" : city,
    }));
  };

  const toggleProjectType = (type: string) => {
    setInputs((prev) => ({
      ...prev,
      projectType: prev.projectType === type ? "" : type,
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
      city: "",
      projectType: "",
      verified: false,
      featured: false,
      sortBy: "relevance" as const,
    };
    setInputs(defaultState);
    setAppliedFilters(defaultState);
  };

  const STYLES = ["Modern Minimal", "Contemporary Indian", "Tropical", "Luxury Villa", "Sustainable", "Courtyard"];
  const EXPERTISE = ["Vastu", "Sustainability", "Luxury", "Commercial"];
  const CITIES = ["Bangalore", "Mumbai", "Delhi", "Pune", "Hyderabad", "Chennai"];

  return (
    <PageTransition>
      <Header variant="default" />
      <main>
        <DomeHero
          kicker="Discover"
          title="Find the architect who understands your Indian home"
          subtitle="Filter by city, style, budget, verification, and project type to match with the right studio."
          imageUrl="https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1920&q=80"
          align="left"
          className="pt-20"
        />

        {/* Filters */}
        <Section padding="none" className="pb-12">
          <Container>
            <Reveal delay={0.2}>
              <div className="dome-card p-6 space-y-6">
                {/* Style chips */}
                <div>
                  <span className="text-caption text-muted-foreground block mb-3">Style</span>
                  <div className="flex flex-wrap gap-2">
                    {STYLES.map((style) => (
                      <button
                        key={style}
                        onClick={() => toggleStyle(style)}
                        className={`dome-chip cursor-pointer transition-colors duration-200 ${
                          inputs.preferredStyle === style
                            ? "bg-foreground text-background border-foreground"
                            : "hover:border-foreground/50"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expertise chips */}
                <div>
                  <span className="text-caption text-muted-foreground block mb-3">Expertise</span>
                  <div className="flex flex-wrap gap-2">
                    {EXPERTISE.map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleProjectType(type)}
                        className={`dome-chip cursor-pointer transition-colors duration-200 ${
                          inputs.projectType === type
                            ? "bg-foreground text-background border-foreground"
                            : "hover:border-foreground/50"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trust chips */}
                <div>
                  <span className="text-caption text-muted-foreground block mb-3">Trust</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setInputs((p) => ({ ...p, verified: !p.verified }))}
                      className={`dome-chip cursor-pointer transition-colors duration-200 ${
                        inputs.verified ? "bg-foreground text-background border-foreground" : "hover:border-foreground/50"
                      }`}
                    >
                      Verified Only
                    </button>
                    <button
                      onClick={() => setInputs((p) => ({ ...p, featured: !p.featured }))}
                      className={`dome-chip cursor-pointer transition-colors duration-200 ${
                        inputs.featured ? "bg-foreground text-background border-foreground" : "hover:border-foreground/50"
                      }`}
                    >
                      Featured Only
                    </button>
                  </div>
                </div>

                {/* City chips */}
                <div>
                  <span className="text-caption text-muted-foreground block mb-3">City</span>
                  <div className="flex flex-wrap gap-2">
                    {CITIES.map((city) => (
                      <button
                        key={city}
                        onClick={() => toggleCity(city)}
                        className={`dome-chip cursor-pointer transition-colors duration-200 ${
                          inputs.city === city
                            ? "bg-foreground text-background border-foreground"
                            : "hover:border-foreground/50"
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget range + Sort */}
                <div className="flex flex-wrap items-end gap-6 pt-2 border-t border-border/50">
                  <FilterGroup label="Budget Range">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        name="minBudget"
                        placeholder="Min"
                        value={inputs.minBudget || ""}
                        onChange={(e) => setInputs((p) => ({ ...p, minBudget: Number(e.target.value) }))}
                        className="w-28 dome-input"
                      />
                      <span className="text-muted-foreground">—</span>
                      <input
                        type="number"
                        name="maxBudget"
                        placeholder="Max"
                        value={inputs.maxBudget === 100000 ? "" : inputs.maxBudget}
                        onChange={(e) => setInputs((p) => ({ ...p, maxBudget: Number(e.target.value) || 100000 }))}
                        className="w-28 dome-input"
                      />
                    </div>
                  </FilterGroup>

                  <FilterGroup label="Sort by">
                    <select
                      value={inputs.sortBy}
                      onChange={(e) => setInputs((p) => ({ ...p, sortBy: e.target.value as typeof inputs.sortBy }))}
                      className="dome-input w-44"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="rating">Rating</option>
                      <option value="trust">Trust Score</option>
                      <option value="response">Response Speed</option>
                    </select>
                  </FilterGroup>

                  <div className="flex items-center gap-3 ml-auto">
                    <button onClick={handleSearch} className="dome-button relative">
                      Apply Filters
                      {activeFilterCount > 0 && (
                        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center border-2 border-background">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>
                    <button onClick={handleClear} className="dome-button-outline">
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </Container>
        </Section>

        {/* Architect List */}
        <Section padding="small">
          <Container>
            {sortedRecommendations.length > 0 && (
              <div className="mb-12">
                <Reveal>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-display-sm">Recommended for you</h2>
                    <span className="text-caption text-muted-foreground">Based on your preferences</span>
                  </div>
                </Reveal>
                <Grid cols={3} gap="default">
                  {sortedRecommendations.filter(a => a && a.slug).map((architect, index) => (
                    <Reveal key={architect._id || index} delay={index * 0.08}>
                      <ArchitectDiscoveryCard
                        architect={architect}
                        saved={savedIds.has(architect._id)}
                        reason="Ranked for your budget, city, and style signals"
                        onSave={saveMutation.mutate}
                        onUnsave={unsaveMutation.mutate}
                      />
                    </Reveal>
                  ))}
                </Grid>
              </div>
            )}
            <Grid cols={3} gap="default">
              {isLoading && (
                <Reveal>
                  <div className="space-y-6 py-8">
                    <ArchitectCardSkeleton />
                    <ArchitectCardSkeleton />
                  </div>
                </Reveal>
              )}
              {sortedArchitects.filter(a => a && a.slug).map((architect, index) => (
                <Reveal key={architect._id || index} delay={index * 0.08}>
                  <ArchitectDiscoveryCard
                    architect={architect}
                    saved={savedIds.has(architect._id)}
                    onSave={saveMutation.mutate}
                    onUnsave={unsaveMutation.mutate}
                  />
                </Reveal>
              ))}
            </Grid>

            {!isLoading && sortedArchitects.length === 0 && (
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

const ArchitectCardSkeleton = () => (
  <div className="dome-card overflow-hidden">
    <Skeleton className="aspect-[4/3] w-full rounded-none" />
    <div className="space-y-3 p-5">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
      <Skeleton className="h-10 w-full rounded-full" />
    </div>
  </div>
);

export default Explore;