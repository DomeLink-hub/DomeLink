import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
import { api } from "@/lib/api";

export default function BudgetRealityChecker() {
  const [budget, setBudget] = useState(0);
  const [plotSize, setPlotSize] = useState("");
  const [projectType, setProjectType] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Call backend endpoint (to be implemented) for budget analysis
      const res = await api.checkBudgetReality({ budget, plotSize, projectType });
      setResult(res);
    } catch (err) {
      setResult({ error: "Could not analyze budget. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <Header />
      <Section>
        <Container>
          <h1 className="text-2xl font-bold mb-4">Budget Reality Checker</h1>
          <p className="mb-6 text-muted-foreground">
            Enter your project details and budget. We'll tell you if your budget is realistic for your goals.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
            <div>
              <label className="block mb-1 font-medium">Project Type</label>
              <select
                className="dome-input w-full"
                value={projectType}
                onChange={e => setProjectType(e.target.value)}
                required
              >
                <option value="">Select type</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="interior">Interior</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Plot Size (sq ft)</label>
              <input
                type="text"
                className="dome-input w-full"
                value={plotSize}
                onChange={e => setPlotSize(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Budget (USD)</label>
              <input
                type="number"
                className="dome-input w-full"
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                min={0}
                required
              />
            </div>
            <button
              type="submit"
              className="dome-button px-8 py-2"
              disabled={loading}
            >
              {loading ? "Checking..." : "Check My Budget"}
            </button>
          </form>
          {result && (
            <div className="mt-8">
              {result.error ? (
                <div className="text-red-500">{result.error}</div>
              ) : (
                <div className="dome-panel p-6 text-center">
                  <h2 className="text-xl font-semibold mb-2">Reality Check Result</h2>
                  <p className="mb-2">{result.message}</p>
                  {result.suggestions && (
                    <ul className="list-disc list-inside text-left mx-auto max-w-md">
                      {result.suggestions.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </Container>
      </Section>
      <Footer />
    </PageTransition>
  );
}
