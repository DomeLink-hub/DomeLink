import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
import Reveal from "@/components/animations/Reveal";
import { api, type AvoraReport } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/useAuthContext";

/* ── types ───────────────────────────────────────────────────── */
type FormData = {
  city: string; locationType: string; plotSize: string; builtUpArea: string;
  floors: string; timeline: string; familySize: string; architectureStyle: string;
  lifestyleFeatures: string[]; interiorTier: string; vastuRequired: boolean;
  prayerRoom: boolean; courtyard: boolean; budgetMin: string; budgetMax: string;
  budgetFlexibility: string; materialPreference: string;
};

const defaultForm: FormData = {
  city: "", locationType: "Urban", plotSize: "", builtUpArea: "", floors: "2",
  timeline: "", familySize: "", architectureStyle: "", lifestyleFeatures: [],
  interiorTier: "Premium", vastuRequired: false, prayerRoom: false, courtyard: false,
  budgetMin: "", budgetMax: "", budgetFlexibility: "Moderate", materialPreference: "Standard",
};

const steps = [
  { id: "basics",    label: "01", eyebrow: "Project Basics",     title: "Where and what are you building?" },
  { id: "style",     label: "02", eyebrow: "Design Language",    title: "Define your architectural vision." },
  { id: "lifestyle", label: "03", eyebrow: "Lifestyle",          title: "How will you live in this space?" },
  { id: "interior",  label: "04", eyebrow: "Quality & Culture",  title: "Set the finish level and cultural tone." },
  { id: "budget",    label: "05", eyebrow: "Financial Profile",  title: "Define the investment parameters." },
];

const CITIES = ["Bangalore","Mumbai","Pune","Hyderabad","Chennai","Kochi","Ahmedabad","Jaipur","Delhi","Gurgaon","Lucknow","Kolkata","Chandigarh","Surat","Nagpur"];
const STYLES = ["Modern Minimal","Contemporary Indian","Tropical","Brutalist","Luxury Villa","Sustainable","Courtyard","Scandinavian","Japandi","Industrial","Traditional","Custom"];
const LIFESTYLE = ["Smart Home","Home Office","Swimming Pool","Terrace Garden","Landscape Design","Guest Rooms","Entertainment Area","Parking (2+ cars)","Gym / Wellness","Library / Study"];
const INTERIOR_TIERS = ["Essential","Premium","Luxury","Ultra Luxury"];
const TIMELINES = ["Immediately","3–6 months","6–12 months","Planning Stage"];
const FLEXIBILITY = ["Fixed","Moderate","Flexible"];
const MATERIALS = ["Standard","Premium Local","Imported Premium","Sustainable / Green","Mixed"];

const slide = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -16 } };
const formatINR = (n: number) => n >= 10_000_000 ? `₹${(n / 10_000_000).toFixed(2)}Cr` : `₹${(n / 100_000).toFixed(1)}L`;

/* ── Shared primitives ───────────────────────────────────────── */
const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-caption text-muted-foreground block mb-2">{children}</span>
);

const Chip = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
  <button type="button" onClick={onClick}
    className={`rounded-xl border px-4 py-2.5 text-sm text-left transition-all duration-200 ${
      active ? "border-foreground bg-foreground text-background" : "border-border/60 bg-card/60 text-foreground hover:border-foreground/40"
    }`}>{label}</button>
);

/* ── Report primitives ───────────────────────────────────────── */
const ScoreMeter = ({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-caption text-muted-foreground">{label}</span>
      <span className="text-body-sm font-medium">{value}<span className="text-muted-foreground">/10</span></span>
    </div>
    <div className="h-1.5 bg-border/40 rounded-full overflow-hidden">
      <motion.div className="h-full bg-foreground rounded-full"
        initial={{ width: 0 }} animate={{ width: `${value * 10}%` }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay }} />
    </div>
  </div>
);

const InsightCard = ({ title, items, delay = 0 }: { title: string; items: string[]; delay?: number }) => (
  <Reveal delay={delay}>
    <div className="dome-card p-6 h-full">
      <p className="text-caption text-muted-foreground mb-4">{title}</p>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-body-sm">
            <span className="dome-node mt-1.5 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </Reveal>
);

const BudgetBar = ({ label, value, total, delay = 0 }: { label: string; value: number; total: number; delay?: number }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-body-sm text-muted-foreground">{label}</span>
        <span className="text-body-sm font-medium">{formatINR(value)}</span>
      </div>
      <div className="h-1 bg-border/40 rounded-full overflow-hidden">
        <motion.div className="h-full bg-foreground/70 rounded-full"
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay }} />
      </div>
      <span className="text-xs text-muted-foreground">{pct}%</span>
    </div>
  );
};

const feasibilityColor: Record<string, string> = {
  "Well Within Budget": "text-emerald-400",
  "Feasible":           "text-emerald-400",
  "Tight":              "text-amber-400",
  "Ambitious":          "text-orange-400",
  "Requires Revision":  "text-red-400",
  "Unspecified":        "text-muted-foreground",
};

/* ── PDF Export ──────────────────────────────────────────────── */
const exportPDF = (report: AvoraReport, form: FormData, userName: string) => {
  const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Avora Feasibility Report — ${form.city}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@300;400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter',sans-serif;background:#0d0c0b;color:#e8e4de;padding:48px;font-size:13px;line-height:1.7}
  .header{border-bottom:1px solid #2a2825;padding-bottom:32px;margin-bottom:40px;display:flex;justify-content:space-between;align-items:flex-end}
  .brand{font-family:'Playfair Display',serif;font-size:22px;letter-spacing:0.15em;text-transform:uppercase;color:#e8e4de}
  .brand span{color:#c98d2c}
  .meta{text-align:right;color:#6b6560;font-size:11px;line-height:1.8}
  h1{font-family:'Playfair Display',serif;font-size:32px;font-weight:400;margin-bottom:8px;color:#f0ece6}
  h2{font-family:'Playfair Display',serif;font-size:18px;font-weight:400;margin-bottom:16px;color:#d4cfc9;border-bottom:1px solid #2a2825;padding-bottom:8px}
  h3{font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:#6b6560;margin-bottom:12px}
  .subtitle{color:#8a8480;font-size:14px;margin-bottom:40px}
  .cost-hero{background:#1a1917;border:1px solid #2a2825;border-radius:8px;padding:32px;margin-bottom:32px;display:flex;justify-content:space-between;align-items:center}
  .cost-range{font-family:'Playfair Display',serif;font-size:36px;color:#f0ece6}
  .cost-meta{color:#6b6560;font-size:12px;margin-top:6px}
  .chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
  .chip{background:#2a2825;border:1px solid #3a3835;border-radius:20px;padding:4px 12px;font-size:11px;color:#a09890}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px}
  .card{background:#1a1917;border:1px solid #2a2825;border-radius:8px;padding:24px}
  .card ul{list-style:none;padding:0}
  .card ul li{padding:6px 0;border-bottom:1px solid #2a2825;color:#c4bfb9;font-size:12px}
  .card ul li:last-child{border-bottom:none}
  .card ul li::before{content:"— ";color:#c98d2c}
  .budget-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #2a2825;font-size:12px}
  .budget-row:last-child{border-bottom:none;font-weight:500;color:#f0ece6;padding-top:12px}
  .score-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #2a2825}
  .score-bar{height:4px;background:#2a2825;border-radius:2px;flex:1;margin:0 12px}
  .score-fill{height:100%;background:#c98d2c;border-radius:2px}
  .footer{margin-top:48px;padding-top:24px;border-top:1px solid #2a2825;display:flex;justify-content:space-between;color:#4a4845;font-size:11px}
  .feasibility{font-size:18px;font-weight:500}
  .feasible{color:#4ade80} .tight{color:#fbbf24} .ambitious{color:#fb923c} .revision{color:#f87171}
  .section{margin-bottom:32px}
  .next-actions li{padding:8px 0;border-bottom:1px solid #2a2825;color:#c4bfb9;font-size:12px;counter-increment:step}
  .next-actions li::before{content:counter(step) ". ";color:#c98d2c;font-weight:500}
  .next-actions{counter-reset:step;list-style:none;padding:0}
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="brand">Dome<span>Link</span> · Avora</div>
    <div style="color:#6b6560;font-size:11px;margin-top:4px">Architectural Intelligence Engine</div>
  </div>
  <div class="meta">
    <div>Prepared for ${userName}</div>
    <div>${date}</div>
    <div>Confidential Feasibility Report</div>
  </div>
</div>

<h1>Architectural Feasibility Report</h1>
<div class="subtitle">${form.city} · ${form.plotSize} sq ft · ${form.floors} floor${Number(form.floors) > 1 ? "s" : ""} · ${form.architectureStyle || "Modern"}</div>

<div class="cost-hero">
  <div>
    <h3>Avora Cost Estimate</h3>
    <div class="cost-range">${formatINR(report.costRange.min)} — ${formatINR(report.costRange.max)}</div>
    <div class="cost-meta">${report.estimatedTimeline} · ${report.aiBudgetBreakdown.builtUpArea.toLocaleString()} sq ft built-up · ₹${report.aiBudgetBreakdown.psfRate.toLocaleString()}/sq ft</div>
    <div class="chips">
      <span class="chip">${report.architectTier}</span>
      <span class="chip">${report.constructionDifficulty}</span>
      <span class="chip">${report.consultationPath}</span>
    </div>
  </div>
  <div style="text-align:right">
    <h3>Budget Feasibility</h3>
    <div class="feasibility ${report.budgetFeasibility === "Feasible" || report.budgetFeasibility === "Well Within Budget" ? "feasible" : report.budgetFeasibility === "Tight" ? "tight" : report.budgetFeasibility === "Ambitious" ? "ambitious" : "revision"}">${report.budgetFeasibility}</div>
  </div>
</div>

<div class="section">
  <h2>Project Intelligence</h2>
  <div class="card">
    <div class="score-row"><span style="font-size:12px;color:#a09890;width:140px">Complexity Score</span><div class="score-bar"><div class="score-fill" style="width:${report.complexityScore * 10}%"></div></div><span style="font-size:12px">${report.complexityScore}/10</span></div>
    <div class="score-row"><span style="font-size:12px;color:#a09890;width:140px">Project Readiness</span><div class="score-bar"><div class="score-fill" style="width:${report.readinessScore * 10}%"></div></div><span style="font-size:12px">${report.readinessScore}/10</span></div>
  </div>
  <div style="margin-top:16px;background:#1a1917;border:1px solid #2a2825;border-radius:8px;padding:20px;color:#c4bfb9;font-size:13px;line-height:1.8">${report.designSummary}</div>
</div>

<div class="section">
  <h2>Budget Breakdown</h2>
  <div class="card">
    <div class="budget-row"><span style="color:#a09890">Construction</span><span>${formatINR(report.aiBudgetBreakdown.construction)}</span></div>
    <div class="budget-row"><span style="color:#a09890">Architecture Fees</span><span>${formatINR(report.aiBudgetBreakdown.architecture)}</span></div>
    <div class="budget-row"><span style="color:#a09890">Interiors</span><span>${formatINR(report.aiBudgetBreakdown.interiors)}</span></div>
    <div class="budget-row"><span style="color:#a09890">Add-ons & Landscape</span><span>${formatINR(report.aiBudgetBreakdown.addOns)}</span></div>
    <div class="budget-row"><span>Total Estimate</span><span>${formatINR(report.aiBudgetBreakdown.total)}</span></div>
  </div>
</div>

<div class="grid2">
  <div class="card"><h3>Space Planning</h3><ul>${report.spacePlanning.map(s => `<li>${s}</li>`).join("")}</ul></div>
  <div class="card"><h3>Climate Strategies</h3><ul>${report.climateSuggestions.map(s => `<li>${s}</li>`).join("")}</ul></div>
  <div class="card"><h3>Sustainability</h3><ul>${report.sustainabilitySuggestions.map(s => `<li>${s}</li>`).join("")}</ul></div>
  <div class="card"><h3>Material Direction</h3><ul>${report.materialRecommendations.map(s => `<li>${s}</li>`).join("")}</ul></div>
</div>

<div class="section">
  <h2>Interior Direction</h2>
  <div class="card" style="color:#c4bfb9;font-size:13px;line-height:1.8">${report.interiorDirection}</div>
</div>

<div class="grid2">
  <div class="card"><h3>Risk Factors</h3><ul>${report.riskFactors.map(s => `<li>${s}</li>`).join("")}</ul></div>
  <div class="card"><h3>Recommended Next Actions</h3><ol class="next-actions">${(report.nextActions ?? []).map(s => `<li>${s}</li>`).join("")}</ol></div>
</div>

<div class="footer">
  <div>Generated by Avora Intelligence · DomeLink Platform</div>
  <div>This report is indicative. Engage a verified architect for detailed estimates.</div>
</div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Avora-Report-${form.city}-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Report exported. Open in browser and print to PDF.");
};

/* ── Loading overlay ─────────────────────────────────────────── */
const AvoraLoadingOverlay = () => (
  <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.div className="space-y-8 text-center max-w-sm px-6">
      <motion.div className="w-16 h-16 mx-auto relative"
        animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
        <div className="absolute inset-0 rounded-full border border-foreground/20" />
        <div className="absolute inset-0 rounded-full border-t border-foreground animate-spin" style={{ animationDuration: "1.5s" }} />
        <div className="absolute inset-2 rounded-full border border-foreground/10" />
      </motion.div>
      <div className="space-y-3">
        <p className="text-caption text-muted-foreground tracking-[0.3em]">Avora Intelligence</p>
        <motion.p className="text-display-sm"
          animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
          Analysing your project…
        </motion.p>
        <p className="text-body-sm text-muted-foreground">
          Cross-referencing regional construction rates, climate data, and architectural complexity.
        </p>
      </div>
      <div className="space-y-2">
        {["Regional cost calibration","Complexity assessment","AI insight generation","Report compilation"].map((step, i) => (
          <motion.div key={step} className="flex items-center gap-3 text-body-sm text-muted-foreground"
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.6, duration: 0.4 }}>
            <motion.span className="w-1.5 h-1.5 rounded-full bg-foreground/40 flex-shrink-0"
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ delay: i * 0.6, duration: 1.2, repeat: Infinity }} />
            {step}
          </motion.div>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

/* ── Main component ──────────────────────────────────────────── */
export default function AvoraEstimate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AvoraReport | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const activeStep = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const set = <K extends keyof FormData>(key: K, val: FormData[K]) => setForm(f => ({ ...f, [key]: val }));
  const toggleFeature = (f: string) => set("lifestyleFeatures",
    form.lifestyleFeatures.includes(f) ? form.lifestyleFeatures.filter(x => x !== f) : [...form.lifestyleFeatures, f]);

  const canContinue = () => {
    if (activeStep.id === "basics") return !!form.city && !!form.plotSize && !!form.floors;
    if (activeStep.id === "style") return !!form.architectureStyle;
    if (activeStep.id === "budget") return !!form.budgetMin && !!form.budgetMax;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await api.generateAvoraEstimate({
        city: form.city, locationType: form.locationType,
        plotSize: Number(form.plotSize), builtUpArea: form.builtUpArea ? Number(form.builtUpArea) : undefined,
        floors: Number(form.floors), timeline: form.timeline,
        familySize: form.familySize ? Number(form.familySize) : undefined,
        architectureStyle: form.architectureStyle, lifestyleFeatures: form.lifestyleFeatures,
        interiorTier: form.interiorTier, vastuRequired: form.vastuRequired,
        prayerRoom: form.prayerRoom, courtyard: form.courtyard,
        budgetMin: Number(form.budgetMin), budgetMax: Number(form.budgetMax),
        budgetFlexibility: form.budgetFlexibility, materialPreference: form.materialPreference,
      });
      setReport(result.report);
    } catch (err: any) {
      toast.error(err?.message || "Estimation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Report view ─────────────────────────────────────────── */
  if (report) {
    const bd = report.aiBudgetBreakdown;
    return (
      <PageTransition>
        <div ref={reportRef}>
          {/* Hero */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80" alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-background" />
            </div>
            <Header variant="minimal" />
            <div className="relative z-10 pt-32 pb-24">
              <Container size="wide">
                <Reveal>
                  <div className="max-w-3xl">
                    <p className="text-caption text-white/40 tracking-[0.4em] mb-4">Generated by Avora Intelligence</p>
                    <h1 className="text-display-lg text-white dome-bracket mb-6">Architectural Feasibility Report</h1>
                    <p className="text-body-lg text-white/60 max-w-2xl">{report.designSummary}</p>
                    <div className="flex flex-wrap gap-3 mt-8">
                      <span className="dome-chip border-white/20 text-white/60">{form.city}</span>
                      <span className="dome-chip border-white/20 text-white/60">{form.plotSize} sq ft</span>
                      <span className="dome-chip border-white/20 text-white/60">{form.floors} floor{Number(form.floors) > 1 ? "s" : ""}</span>
                      <span className="dome-chip border-white/20 text-white/60">{form.architectureStyle}</span>
                      <span className="dome-chip border-white/20 text-white/60">{report.estimatedTimeline}</span>
                    </div>
                  </div>
                </Reveal>
              </Container>
            </div>
          </div>

          <div className="bg-background pb-24">
            <Container size="wide">

              {/* Cost hero card */}
              <Reveal>
                <div className="dome-panel p-8 md:p-10 mb-8 -mt-12 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-start">
                    <div>
                      <p className="text-caption text-muted-foreground mb-3">Avora Cost Estimate</p>
                      <div className="text-display-lg">{formatINR(report.costRange.min)} — {formatINR(report.costRange.max)}</div>
                      <p className="text-body-sm text-muted-foreground mt-2">
                        {bd.builtUpArea.toLocaleString()} sq ft built-up · ₹{bd.psfRate.toLocaleString()}/sq ft effective rate
                      </p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        <span className="dome-chip">{report.architectTier}</span>
                        <span className="dome-chip">{report.constructionDifficulty}</span>
                        <span className="dome-chip">{report.consultationPath}</span>
                      </div>
                    </div>
                    <div className="space-y-5 min-w-[200px]">
                      <ScoreMeter value={report.complexityScore} label="Complexity" delay={0.3} />
                      <ScoreMeter value={report.readinessScore} label="Project Readiness" delay={0.5} />
                      <div>
                        <p className="text-caption text-muted-foreground mb-1">Budget Feasibility</p>
                        <p className={`text-body font-medium ${feasibilityColor[report.budgetFeasibility] ?? "text-foreground"}`}>
                          {report.budgetFeasibility}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Budget breakdown */}
              <Reveal delay={0.1}>
                <div className="dome-card p-6 md:p-8 mb-6">
                  <p className="text-caption text-muted-foreground mb-6">Budget Breakdown</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    {[
                      { label: "Construction",      value: bd.construction },
                      { label: "Architecture Fees", value: bd.architecture },
                      { label: "Interiors",         value: bd.interiors },
                      { label: "Add-ons",           value: bd.addOns },
                    ].map((item, i) => (
                      <div key={item.label}>
                        <p className="text-caption text-muted-foreground">{item.label}</p>
                        <p className="text-display-sm mt-1">{formatINR(item.value)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4 border-t border-border/40 pt-6">
                    {[
                      { label: "Structure",  value: bd.breakdown.structure },
                      { label: "Finishing",  value: bd.breakdown.finishing },
                      { label: "MEP",        value: bd.breakdown.mep },
                      { label: "Façade",     value: bd.breakdown.facade },
                      { label: "Landscape",  value: bd.breakdown.landscape },
                    ].map((item, i) => (
                      <BudgetBar key={item.label} label={item.label} value={item.value} total={bd.construction} delay={0.1 + i * 0.08} />
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/40 flex justify-between items-center">
                    <span className="text-body-sm text-muted-foreground">Total Estimate (incl. 5% inflation buffer)</span>
                    <span className="text-display-sm">{formatINR(bd.total)}</span>
                  </div>
                </div>
              </Reveal>

              {/* Insights grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <InsightCard title="Space Planning" items={report.spacePlanning} delay={0.1} />
                <InsightCard title="Climate Strategies" items={report.climateSuggestions} delay={0.15} />
                <InsightCard title="Sustainability" items={report.sustainabilitySuggestions} delay={0.2} />
                <InsightCard title="Material Direction" items={report.materialRecommendations} delay={0.25} />
              </div>

              {/* Interior + Risk */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Reveal delay={0.3}>
                  <div className="dome-card p-6">
                    <p className="text-caption text-muted-foreground mb-3">Interior Direction</p>
                    <p className="text-body leading-relaxed">{report.interiorDirection}</p>
                  </div>
                </Reveal>
                <InsightCard title="Project Risk Factors" items={report.riskFactors} delay={0.3} />
              </div>

              {/* Next actions */}
              {(report.nextActions ?? []).length > 0 && (
                <Reveal delay={0.35}>
                  <div className="dome-card p-6 mb-8">
                    <p className="text-caption text-muted-foreground mb-4">Recommended Next Actions</p>
                    <ol className="space-y-3">
                      {report.nextActions.map((action, i) => (
                        <li key={i} className="flex items-start gap-4 text-body-sm">
                          <span className="text-caption text-muted-foreground flex-shrink-0 w-6">0{i + 1}</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </Reveal>
              )}

              {/* Avora-matched architects */}
              <Reveal delay={0.38}>
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-caption text-muted-foreground mb-1">Avora Spatial Match</p>
                      <h2 className="text-display-sm">Architects matched to your profile</h2>
                    </div>
                    <Link to={`/find-architects?city=${encodeURIComponent(form.city)}&style=${encodeURIComponent(form.architectureStyle)}`}
                      className="text-caption text-muted-foreground hover:text-foreground transition-colors link-underline">
                      View all
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: "Studio Morphe", specialty: `${form.architectureStyle} · ${form.city}`, tier: report.architectTier, img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80" },
                      { name: "Atelier Veda", specialty: `Luxury Residential · ${form.city}`, tier: report.architectTier, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" },
                      { name: "Form & Field", specialty: `Contemporary · ${form.city}`, tier: report.architectTier, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80" },
                    ].map((arch, i) => (
                      <motion.div key={arch.name}
                        className="dome-card p-5 flex items-center gap-4 hover:border-foreground/40 transition-colors cursor-pointer"
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ y: -2 }}
                        onClick={() => navigate("/find-architects")}>
                        <img src={arch.img} alt={arch.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-body-sm font-medium truncate">{arch.name}</p>
                          <p className="text-caption text-muted-foreground truncate">{arch.specialty}</p>
                          <span className="dome-chip text-xs mt-1 inline-block">{arch.tier}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-caption text-muted-foreground mt-3 text-center">
                    Showing representative matches. <Link to="/find-architects" className="text-foreground link-underline">Browse all verified architects</Link> for live profiles.
                  </p>
                </div>
              </Reveal>

              {/* CTA */}
              <Reveal delay={0.4}>
                <div className="dome-panel p-8 md:p-10">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
                    <div>
                      <p className="text-caption text-muted-foreground mb-2">{report.consultationPath}</p>
                      <h2 className="text-display-md mb-3">Ready to begin your project?</h2>
                      <p className="text-body text-muted-foreground max-w-lg">
                        Connect with a verified architect matched to your city, style, and budget tier. Share this report as your starting brief.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 flex-shrink-0">
                      <motion.button className="dome-button px-8 py-3"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/find-architects")}>
                        Find Matched Architects
                      </motion.button>
                      <motion.button className="dome-button-outline px-8 py-3"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => exportPDF(report, form, user?.name ?? "Homeowner")}>
                        Export Report
                      </motion.button>
                      <motion.button className="text-caption text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => { setReport(null); setStepIndex(0); setForm(defaultForm); }}>
                        New Estimate
                      </motion.button>
                    </div>
                  </div>
                </div>
              </Reveal>

            </Container>
          </div>
        </div>
        <Footer />
      </PageTransition>
    );
  }

  /* ── Questionnaire ───────────────────────────────────────── */
  return (
    <PageTransition>
      <AnimatePresence>{loading && <AvoraLoadingOverlay />}</AnimatePresence>

      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1494526585095-c41746248156?w=1920&q=80" alt="" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-black/35" />
        </div>
        <Header variant="minimal" />

        <div className="relative z-10 min-h-screen flex items-center">
          <div className="w-full pt-28 pb-16">
            <Container size="wide">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-10 xl:gap-16 items-start">

                {/* Left */}
                <div className="space-y-8">
                  <div className="space-y-4 max-w-2xl">
                    <motion.p className="text-caption tracking-[0.35em] uppercase text-white/50"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                      {activeStep.eyebrow}
                    </motion.p>
                    <AnimatePresence mode="wait">
                      <motion.h1 key={activeStep.title} variants={slide} initial="hidden" animate="visible" exit="exit"
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="text-display-lg text-white dome-bracket">
                        {activeStep.title}
                      </motion.h1>
                    </AnimatePresence>
                    <p className="text-body text-white/55 max-w-md">
                      Avora cross-references regional construction rates, climate data, and architectural complexity to generate a precise feasibility report.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {steps.map((s, i) => (
                      <div key={s.id} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                        i === stepIndex ? "bg-white" : i < stepIndex ? "bg-white/50" : "bg-white/15"
                      }`} />
                    ))}
                  </div>
                  <p className="text-xs text-white/35">Step {stepIndex + 1} of {steps.length}</p>
                </div>

                {/* Right: form card */}
                <div className="lg:sticky lg:top-8">
                  <motion.div className="dome-panel p-6 sm:p-8"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                    <AnimatePresence mode="wait">

                      {activeStep.id === "basics" && (
                        <motion.div key="basics" variants={slide} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.4 }} className="space-y-5">
                          <div><FieldLabel>City</FieldLabel>
                            <select value={form.city} onChange={e => set("city", e.target.value)} className="dome-input">
                              <option value="">Select city</option>
                              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div><FieldLabel>Location Type</FieldLabel>
                            <div className="grid grid-cols-3 gap-2">
                              {["Urban","Suburban","Rural"].map(t => <Chip key={t} active={form.locationType === t} onClick={() => set("locationType", t)} label={t} />)}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div><FieldLabel>Plot Size (sq ft)</FieldLabel>
                              <input type="number" className="dome-input" value={form.plotSize} onChange={e => set("plotSize", e.target.value)} placeholder="2400" min={200} />
                            </div>
                            <div><FieldLabel>Floors</FieldLabel>
                              <input type="number" className="dome-input" value={form.floors} onChange={e => set("floors", e.target.value)} placeholder="2" min={1} max={10} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div><FieldLabel>Family Size</FieldLabel>
                              <input type="number" className="dome-input" value={form.familySize} onChange={e => set("familySize", e.target.value)} placeholder="4" min={1} />
                            </div>
                            <div><FieldLabel>Timeline</FieldLabel>
                              <select value={form.timeline} onChange={e => set("timeline", e.target.value)} className="dome-input">
                                <option value="">Select</option>
                                {TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeStep.id === "style" && (
                        <motion.div key="style" variants={slide} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.4 }} className="space-y-5">
                          <FieldLabel>Architecture Style</FieldLabel>
                          <div className="grid grid-cols-2 gap-2">
                            {STYLES.map(s => <Chip key={s} active={form.architectureStyle === s} onClick={() => set("architectureStyle", s)} label={s} />)}
                          </div>
                        </motion.div>
                      )}

                      {activeStep.id === "lifestyle" && (
                        <motion.div key="lifestyle" variants={slide} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.4 }} className="space-y-5">
                          <FieldLabel>Lifestyle Features (select all that apply)</FieldLabel>
                          <div className="grid grid-cols-2 gap-2">
                            {LIFESTYLE.map(f => <Chip key={f} active={form.lifestyleFeatures.includes(f)} onClick={() => toggleFeature(f)} label={f} />)}
                          </div>
                        </motion.div>
                      )}

                      {activeStep.id === "interior" && (
                        <motion.div key="interior" variants={slide} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.4 }} className="space-y-5">
                          <div><FieldLabel>Interior Finish Tier</FieldLabel>
                            <div className="grid grid-cols-2 gap-2">
                              {INTERIOR_TIERS.map(t => <Chip key={t} active={form.interiorTier === t} onClick={() => set("interiorTier", t)} label={t} />)}
                            </div>
                          </div>
                          <div><FieldLabel>Material Preference</FieldLabel>
                            <div className="grid grid-cols-1 gap-2">
                              {MATERIALS.map(m => <Chip key={m} active={form.materialPreference === m} onClick={() => set("materialPreference", m)} label={m} />)}
                            </div>
                          </div>
                          <div className="space-y-2"><FieldLabel>Cultural Requirements</FieldLabel>
                            {[
                              { key: "vastuRequired" as const, label: "Vastu-aligned design" },
                              { key: "prayerRoom" as const, label: "Dedicated prayer room" },
                              { key: "courtyard" as const, label: "Traditional courtyard" },
                            ].map(({ key, label }) => (
                              <button key={key} type="button" onClick={() => set(key, !form[key])}
                                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                                  form[key] ? "border-foreground bg-foreground text-background" : "border-border/60 bg-card/60 text-foreground hover:border-foreground/40"
                                }`}>{label}</button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {activeStep.id === "budget" && (
                        <motion.div key="budget" variants={slide} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.4 }} className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div><FieldLabel>Budget Min (₹)</FieldLabel>
                              <input type="number" className="dome-input" value={form.budgetMin} onChange={e => set("budgetMin", e.target.value)} placeholder="35,00,000" min={0} />
                            </div>
                            <div><FieldLabel>Budget Max (₹)</FieldLabel>
                              <input type="number" className="dome-input" value={form.budgetMax} onChange={e => set("budgetMax", e.target.value)} placeholder="65,00,000" min={0} />
                            </div>
                          </div>
                          <div><FieldLabel>Budget Flexibility</FieldLabel>
                            <div className="grid grid-cols-3 gap-2">
                              {FLEXIBILITY.map(f => <Chip key={f} active={form.budgetFlexibility === f} onClick={() => set("budgetFlexibility", f)} label={f} />)}
                            </div>
                          </div>
                          <div className="dome-card p-4 text-body-sm text-muted-foreground">
                            Avora cross-references your budget against regional construction rates to produce a deterministic feasibility assessment.
                          </div>
                        </motion.div>
                      )}

                    </AnimatePresence>

                    <div className="mt-8 flex items-center justify-between gap-3">
                      <button type="button" onClick={() => setStepIndex(i => Math.max(i - 1, 0))}
                        disabled={stepIndex === 0 || loading} className="dome-button-outline px-5 py-3 disabled:opacity-40">
                        Back
                      </button>
                      {isLast ? (
                        <motion.button type="button" onClick={handleSubmit}
                          disabled={!canContinue() || loading}
                          className="dome-button px-6 py-3 disabled:opacity-40"
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          Generate Report
                        </motion.button>
                      ) : (
                        <motion.button type="button" onClick={() => setStepIndex(i => i + 1)}
                          disabled={!canContinue()}
                          className="dome-button px-6 py-3 disabled:opacity-40"
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          Continue
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                </div>

              </div>
            </Container>
          </div>
        </div>
      </div>
      <Footer />
    </PageTransition>
  );
}
