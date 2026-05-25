import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { Container } from "@/components/layout/Layout";
import Reveal from "@/components/animations/Reveal";
import DomeHero from "@/components/layout/DomeHero";
import { api } from "@/lib/api";

const CITIES = ["Bangalore","Mumbai","Pune","Hyderabad","Chennai","Delhi","Gurgaon","Jaipur","Kochi","Ahmedabad","Lucknow","Kolkata","Chandigarh"];
const TIERS = ["Essential","Premium","Luxury"];
const TYPES = ["Residential Villa","Apartment Interior","Commercial","Farmhouse","Office"];

const formatINR = (n: number) => n >= 10_000_000 ? `₹${(n / 10_000_000).toFixed(2)}Cr` : `₹${(n / 100_000).toFixed(2)}L`;

const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex justify-between items-center p-4 dome-card">
    <span className="text-body-sm">{label}</span>
    <button type="button" onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${value ? "bg-foreground" : "bg-border"}`}>
      <motion.div className="w-4 h-4 bg-background rounded-full" animate={{ x: value ? 20 : 0 }} transition={{ duration: 0.2 }} />
    </button>
  </div>
);

const BarRow = ({ label, value, total }: { label: string; value: number; total: number }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-body-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{formatINR(value)}</span>
      </div>
      <div className="h-1 bg-border/40 rounded-full overflow-hidden">
        <motion.div className="h-full bg-foreground/70 rounded-full"
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
      </div>
      <span className="text-xs text-muted-foreground">{pct}%</span>
    </div>
  );
};

export default function BudgetRealityChecker() {
  const [form, setForm] = useState({
    city: "Bangalore", plotSizeSqFt: 2400, floors: 2,
    projectType: "Residential Villa", qualityTier: "Premium" as "Essential" | "Premium" | "Luxury",
    interiorsIncluded: true, vastuRequirements: false,
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const data = await api.getBudgetReality({
        city: form.city,
        plotArea: form.plotSizeSqFt,
        floors: form.floors,
        projectType: form.projectType,
        qualityTier: form.qualityTier.toLowerCase() as any,
        interiors: form.interiorsIncluded,
        vastu: form.vastuRequirements,
      } as any);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Budget Intelligence"
          title="Construction cost reality check"
          subtitle="Deterministic regional pricing for Indian residential projects. No guesswork — hard data."
          imageUrl="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
          align="left"
          className="pt-20"
        />

        <div className="py-16 bg-background">
          <Container size="wide">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

              {/* Input */}
              <Reveal>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-caption text-muted-foreground block mb-2">City</label>
                      <select className="dome-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-caption text-muted-foreground block mb-2">Project Type</label>
                      <select className="dome-input" value={form.projectType} onChange={e => setForm({ ...form, projectType: e.target.value })}>
                        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-caption text-muted-foreground block mb-2">Plot Size (sq ft)</label>
                      <input type="number" className="dome-input" value={form.plotSizeSqFt}
                        onChange={e => setForm({ ...form, plotSizeSqFt: Number(e.target.value) })} min={200} />
                    </div>
                    <div>
                      <label className="text-caption text-muted-foreground block mb-2">Floors</label>
                      <input type="number" className="dome-input" value={form.floors}
                        onChange={e => setForm({ ...form, floors: Number(e.target.value) })} min={1} max={10} />
                    </div>
                  </div>

                  <div>
                    <label className="text-caption text-muted-foreground block mb-2">Quality Tier</label>
                    <div className="grid grid-cols-3 gap-2">
                      {TIERS.map(t => (
                        <button key={t} type="button"
                          className={`py-3 px-4 rounded-xl border text-sm transition-all ${
                            form.qualityTier === t ? "border-foreground bg-foreground text-background" : "border-border/60 text-muted-foreground hover:border-foreground/40"
                          }`}
                          onClick={() => setForm({ ...form, qualityTier: t as any })}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Toggle label="Include Turnkey Interiors" value={form.interiorsIncluded} onChange={v => setForm({ ...form, interiorsIncluded: v })} />
                  <Toggle label="Vastu Compliance Required" value={form.vastuRequirements} onChange={v => setForm({ ...form, vastuRequirements: v })} />

                  <motion.button className="dome-button w-full py-4" onClick={calculate} disabled={loading}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-background border-r-transparent animate-spin" />
                        Calculating…
                      </span>
                    ) : "Calculate True Cost"}
                  </motion.button>

                  <div className="dome-card p-4 text-body-sm text-muted-foreground">
                    For a full AI feasibility report with complexity scores, material recommendations, and architect matching, use{" "}
                    <Link to="/homeowner/avora-estimate" className="text-foreground link-underline">Avora Estimate</Link>.
                  </div>
                </div>
              </Reveal>

              {/* Results */}
              <div className="relative min-h-[400px] flex flex-col justify-center">
                {!result && !loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="dome-panel p-12 text-center">
                    <p className="text-display-sm text-foreground/30 mb-3">Awaiting parameters</p>
                    <p className="text-body-sm text-muted-foreground">Configure your project on the left to generate the cost reality check.</p>
                  </motion.div>
                )}

                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-2 border-foreground border-r-transparent animate-spin" />
                  </motion.div>
                )}

                {result && !loading && (
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="dome-panel p-8 space-y-8">

                    <div className="pb-6 border-b border-border/40">
                      <p className="text-caption text-muted-foreground mb-2">Total Estimated Cost</p>
                      <div className="text-display-lg">{formatINR(result.totalEstimatedCost)}</div>
                      <p className="text-body-sm text-muted-foreground mt-2">
                        {result.builtUpArea?.toLocaleString()} sq ft built-up · ₹{result.psfRate?.toLocaleString()}/sq ft
                      </p>
                    </div>

                    <div className="space-y-4">
                      <p className="text-caption text-muted-foreground">Cost Breakdown</p>
                      {result.breakdown ? (
                        <>
                          <BarRow label="Structure" value={result.breakdown.structure} total={result.estimatedConstructionCost} />
                          <BarRow label="Finishing" value={result.breakdown.finishing} total={result.estimatedConstructionCost} />
                          <BarRow label="MEP" value={result.breakdown.mep} total={result.estimatedConstructionCost} />
                          <BarRow label="Façade" value={result.breakdown.facade} total={result.estimatedConstructionCost} />
                        </>
                      ) : null}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border/40">
                      {[
                        { label: "Construction", value: result.estimatedConstructionCost },
                        { label: "Architecture Fees", value: result.architectFeeEstimate },
                        { label: "Interiors", value: result.interiorsEstimate },
                        { label: "Add-ons & Landscape", value: result.addOnsCost },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between text-body-sm">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium">{formatINR(item.value ?? 0)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-border/40">
                      <p className="text-caption text-muted-foreground mb-3">Timeline & Consultation</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="dome-chip">{result.estimatedProjectTimelineMonths} months</span>
                        <span className="dome-chip">{result.suggestedConsultationLevel}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(result.recommendedArchitectCategories ?? []).map((c: string) => (
                          <span key={c} className="dome-chip bg-foreground/10">{c}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

            </div>
          </Container>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}
