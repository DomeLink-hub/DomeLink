import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
import DomeHero from "@/components/layout/DomeHero";
import Reveal from "@/components/animations/Reveal";
import { api, Architect } from "@/lib/api";

const inspirationImages = [
  { url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800", tag: "modern" },
  { url: "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800", tag: "minimalist" },
  { url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800", tag: "industrial" },
  { url: "https://images.unsplash.com/photo-1523413363574-c30aa1c2a516?w=800", tag: "scandinavian" },
  { url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800", tag: "midcentury" },
  { url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800", tag: "bohemian" },
  { url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800", tag: "traditional" },
  { url: "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=800", tag: "coastal" },
  { url: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?w=800", tag: "rustic" },
  { url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800", tag: "eclectic" },
  { url: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?w=800", tag: "farmhouse" },
  { url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800", tag: "contemporary" },
];

export default function StyleQuiz() {
  const [selected, setSelected] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<Architect[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (tag: string) =>
    setSelected((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const handleNext = async () => {
    if (step < inspirationImages.length - 4) {
      setStep(step + 4);
    } else {
      setLoading(true);
      try {
        await api.updateMe({ styleTags: selected });
        const rec = await api.getHomeownerRecommendations({ style: selected.join(",") });
        setRecommendations(rec.recommendations || []);
        setShowResults(true);
      } catch { /* noop */ } finally { setLoading(false); }
    }
  };

  const progress = Math.min((selected.length / 6) * 100, 100);

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Style Discovery"
          title="Discover your design language"
          subtitle="Select the spaces that resonate with you. We'll match you with architects who share your aesthetic."
          imageUrl="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
          align="left"
          className="pt-20"
        />

        {showResults ? (
          <Section padding="small">
            <Container>
              <Reveal>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <span className="dome-kicker">Your matches</span>
                    <h2 className="text-display-md dome-bracket mt-4">Architects aligned to your style</h2>
                  </div>
                  <button className="dome-button" onClick={() => navigate("/homeowner/dashboard?styleQuiz=done")}>
                    Go to Dashboard
                  </button>
                </div>
              </Reveal>

              {loading ? (
                <div className="dome-panel p-16 text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-foreground border-r-transparent animate-spin mx-auto" />
                </div>
              ) : recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {recommendations.map((architect, idx) => (
                    <motion.div
                      key={architect._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                      className="dome-card p-4 group"
                    >
                      <div className="image-zoom aspect-[4/3] mb-4 rounded-xl overflow-hidden">
                        <img src={architect.heroImage} alt={architect.name} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="text-body font-medium">{architect.name}</h3>
                      <p className="text-body-sm text-muted-foreground">{architect.specialty}</p>
                      <p className="text-caption text-muted-foreground mt-1">{architect.location}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="dome-panel p-12 text-center">
                  <p className="text-body text-muted-foreground">No matches found. Try selecting different styles.</p>
                </div>
              )}
            </Container>
          </Section>
        ) : (
          <Section padding="small">
            <Container>
              <Reveal>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="dome-kicker">Step {Math.floor(step / 4) + 1} of {Math.ceil(inspirationImages.length / 4)}</span>
                    <p className="text-body text-muted-foreground mt-2">
                      Select at least 3 images that speak to you.
                    </p>
                  </div>
                  <span className="text-caption text-muted-foreground">{selected.length} selected</span>
                </div>

                {/* Progress bar */}
                <div className="h-px bg-border/60 overflow-hidden rounded-full mb-8">
                  <motion.div
                    className="h-full bg-foreground/70"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </Reveal>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <AnimatePresence initial={false}>
                  {inspirationImages.slice(step, step + 4).map((img, idx) => (
                    <motion.button
                      key={img.url}
                      layoutId={img.url}
                      className={`overflow-hidden rounded-2xl border-2 transition-all duration-300 focus:outline-none ${
                        selected.includes(img.tag)
                          ? "border-foreground scale-[1.02] shadow-lg"
                          : "border-border/40 hover:border-foreground/40"
                      }`}
                      onClick={() => handleSelect(img.tag)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="image-zoom">
                        <img src={img.url} alt={img.tag} className="w-full h-36 object-cover" />
                      </div>
                      <div className={`py-3 px-4 text-left transition-colors ${
                        selected.includes(img.tag) ? "bg-foreground text-background" : "bg-card/60"
                      }`}>
                        <span className="text-caption capitalize">{img.tag}</span>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-body-sm text-muted-foreground">
                  {selected.length < 3 ? `Select ${3 - selected.length} more to continue` : "Ready to see your matches"}
                </p>
                <motion.button
                  className="dome-button disabled:opacity-40"
                  onClick={handleNext}
                  disabled={selected.length < 3 || loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {step < inspirationImages.length - 4 ? "Next" : loading ? "Finding matches…" : "See My Matches"}
                </motion.button>
              </div>
            </Container>
          </Section>
        )}
      </main>
      <Footer />
    </PageTransition>
  );
}
