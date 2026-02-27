import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
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

  const handleSelect = (tag: string) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleNext = async () => {
    if (step < inspirationImages.length - 4) {
      setStep(step + 4);
    } else {
      setLoading(true);
      try {
        await api.updateMe({ styleTags: selected });
        // Fetch recommendations based on selected style tags
        const rec = await api.getHomeownerRecommendations({ style: selected.join(",") });
        setRecommendations(rec.recommendations || []);
        setShowResults(true);
      } catch (e) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    }
  };

  const progress = Math.min((selected.length / 6) * 100, 100);

  return (
    <PageTransition>
      <Header />
      {showResults ? (
        <Section>
          <Container>
            <h1 className="text-2xl font-bold mb-4">Your style matches these architects</h1>
            {loading ? (
              <div className="text-center py-12">Loading recommendations...</div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                {recommendations.map((architect, idx) => (
                  <motion.div
                    key={architect._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className="dome-card p-6 flex flex-col items-center"
                  >
                    <img src={architect.heroImage} alt={architect.name} className="w-full h-40 object-cover rounded-xl mb-4" />
                    <h3 className="text-lg font-semibold mb-1">{architect.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{architect.specialty}</p>
                    <p className="text-xs text-muted-foreground">{architect.location}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">No matches found. Try selecting different styles.</div>
            )}
            <button
              className="dome-button px-8 py-2 mt-8"
              onClick={() => navigate("/homeowner/dashboard?styleQuiz=done")}
            >
              Go to Dashboard
            </button>
          </Container>
        </Section>
      ) : (
        <Section>
          <Container>
            <h1 className="text-2xl font-bold mb-4">Discover Your Design Style</h1>
            <p className="mb-6 text-muted-foreground">Select your favorite inspiration images. We'll match you with architects who share your style.</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <AnimatePresence initial={false}>
                {inspirationImages.slice(step, step + 4).map((img, idx) => (
                  <motion.button
                    key={img.url}
                    layoutId={img.url}
                    className={`overflow-hidden rounded-xl border-4 transition-all duration-300 focus:outline-none ${selected.includes(img.tag) ? "border-primary scale-105" : "border-transparent"}`}
                    onClick={() => handleSelect(img.tag)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <img src={img.url} alt={img.tag} className="w-full h-32 object-cover" />
                    <span className="block text-center py-2 text-sm font-medium capitalize">{img.tag}</span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
            <button
              className="dome-button px-8 py-2"
              onClick={handleNext}
              disabled={selected.length < 3 || loading}
            >
              {step < inspirationImages.length - 4 ? "Next" : loading ? "Loading..." : "See My Matches"}
            </button>
          </Container>
        </Section>
      )}
      <Footer />
    </PageTransition>
  );
}
