/**
 * Avora Deterministic Indian Construction Cost Engine v2
 * Realistic regional pricing with full feature-cost modelling.
 */

export interface BudgetProfileParams {
  city: string;
  plotSizeSqFt: number;
  floors: number;
  projectType: string;
  qualityTier: "Essential" | "Premium" | "Luxury";
  interiorsIncluded: boolean;
  vastuRequirements: boolean;
  lifestyleFeatures?: string[];
  locationType?: string;
  materialPreference?: string;
}

export interface BudgetResult {
  estimatedConstructionCost: number;
  architectFeeEstimate: number;
  interiorsEstimate: number;
  addOnsCost: number;
  totalEstimatedCost: number;
  estimatedProjectTimelineMonths: number;
  suggestedConsultationLevel: string;
  recommendedArchitectCategories: string[];
  builtUpArea: number;
  psfRate: number;
  breakdown: {
    structure: number;
    finishing: number;
    mep: number;       // mechanical, electrical, plumbing
    facade: number;
    landscape: number;
    addOns: number;
  };
}

/* ── City base PSF rates (₹/sq ft, 2024 market data) ─────────── */
const CITY_BASE_PSF: Record<string, number> = {
  mumbai:      2800,
  "navi mumbai": 2400,
  delhi:       2200,
  "new delhi": 2200,
  gurgaon:     2300,
  noida:       2000,
  bangalore:   2100,
  bengaluru:   2100,
  hyderabad:   1950,
  pune:        2000,
  chennai:     1900,
  kochi:       1750,
  ahmedabad:   1650,
  jaipur:      1600,
  lucknow:     1500,
  kolkata:     1700,
  surat:       1600,
  nagpur:      1550,
  indore:      1500,
  chandigarh:  1800,
};

const getCityBasePsf = (city: string): number => {
  const key = city.toLowerCase().trim();
  return CITY_BASE_PSF[key] ?? 1700; // tier-3 fallback
};

/* ── Quality tier multipliers ────────────────────────────────── */
const QUALITY_MULTIPLIER: Record<string, number> = {
  Essential: 1.0,
  Premium:   1.55,
  Luxury:    2.4,
};

/* ── Location type adjustment ────────────────────────────────── */
const LOCATION_MULTIPLIER: Record<string, number> = {
  Urban:    1.0,
  Suburban: 0.92,
  Rural:    0.82,
};

/* ── Material preference adjustment ─────────────────────────── */
const MATERIAL_MULTIPLIER: Record<string, number> = {
  "Standard":          1.0,
  "Premium Local":     1.18,
  "Imported Premium":  1.45,
  "Sustainable / Green": 1.22,
  "Mixed":             1.12,
};

/* ── Add-on costs (₹ flat or per sq ft) ─────────────────────── */
const ADD_ON_COSTS: Record<string, number> = {
  "Swimming Pool":       1_800_000,  // ₹18L average
  "Smart Home":          600_000,    // ₹6L base
  "Landscape Design":    400_000,    // ₹4L
  "Terrace Garden":      250_000,    // ₹2.5L
  "Gym / Wellness":      350_000,    // ₹3.5L
  "Entertainment Area":  300_000,    // ₹3L
  "Library / Study":     150_000,    // ₹1.5L
  "Parking (2+ cars)":   500_000,    // ₹5L (basement/covered)
  "Home Office":         200_000,    // ₹2L
  "Guest Rooms":         0,          // included in BUA
};

/* ── Vastu premium ───────────────────────────────────────────── */
const VASTU_PREMIUM = 1.06;

/* ── Floor complexity multiplier (higher floors = more cost) ── */
const floorComplexityMultiplier = (floors: number): number => {
  if (floors <= 1) return 1.0;
  if (floors === 2) return 1.04;
  if (floors === 3) return 1.09;
  if (floors === 4) return 1.15;
  return 1.15 + (floors - 4) * 0.04; // each additional floor +4%
};

/* ── Architect fee % by tier ─────────────────────────────────── */
const ARCH_FEE_PCT: Record<string, number> = {
  Essential: 0.07,
  Premium:   0.10,
  Luxury:    0.14,
};

/* ── Interior cost per sq ft by tier ────────────────────────── */
const INTERIOR_PSF: Record<string, number> = {
  Essential: 800,
  Premium:   1600,
  Luxury:    3200,
};

/* ── Timeline base months ────────────────────────────────────── */
const baseTimelineMonths = (floors: number, tier: string, hasPool: boolean): number => {
  let months = Math.max(8, floors * 3);
  if (tier === "Premium") months = Math.round(months * 1.15);
  if (tier === "Luxury")  months = Math.round(months * 1.35);
  if (hasPool) months += 2;
  return months;
};

/* ── Main export ─────────────────────────────────────────────── */
export const generateBudgetReality = (params: BudgetProfileParams): BudgetResult => {
  const basePsf      = getCityBasePsf(params.city);
  const qualityMult  = QUALITY_MULTIPLIER[params.qualityTier] ?? 1.0;
  const locationMult = LOCATION_MULTIPLIER[params.locationType ?? "Urban"] ?? 1.0;
  const materialMult = MATERIAL_MULTIPLIER[params.materialPreference ?? "Standard"] ?? 1.0;
  const vastuMult    = params.vastuRequirements ? VASTU_PREMIUM : 1.0;
  const floorMult    = floorComplexityMultiplier(params.floors);

  // Built-up area: 72% plot coverage per floor (realistic FAR)
  const builtUpArea = params.plotSizeSqFt * 0.72 * params.floors;

  // Effective PSF
  const effectivePsf = basePsf * qualityMult * locationMult * materialMult * vastuMult * floorMult;

  // Structure breakdown (% of construction cost)
  const structureCost  = builtUpArea * effectivePsf * 0.55;
  const finishingCost  = builtUpArea * effectivePsf * 0.25;
  const mepCost        = builtUpArea * effectivePsf * 0.12;
  const facadeCost     = builtUpArea * effectivePsf * 0.08;
  const totalConstruction = structureCost + finishingCost + mepCost + facadeCost;

  // Architect fees
  const archFeePct = ARCH_FEE_PCT[params.qualityTier] ?? 0.10;
  const architectFee = totalConstruction * archFeePct;

  // Interiors
  const interiorPsf = INTERIOR_PSF[params.qualityTier] ?? 1600;
  const interiorsCost = params.interiorsIncluded ? builtUpArea * interiorPsf : 0;

  // Landscape (5% of construction for premium+)
  const landscapeCost = params.qualityTier !== "Essential"
    ? totalConstruction * 0.05
    : totalConstruction * 0.02;

  // Add-ons from lifestyle features
  const features = params.lifestyleFeatures ?? [];
  const addOnsCost = features.reduce((sum, f) => sum + (ADD_ON_COSTS[f] ?? 0), 0);

  // Inflation buffer (5%)
  const inflationBuffer = (totalConstruction + architectFee + interiorsCost + landscapeCost + addOnsCost) * 0.05;

  const totalEstimatedCost = Math.round(
    totalConstruction + architectFee + interiorsCost + landscapeCost + addOnsCost + inflationBuffer
  );

  const hasPool = features.includes("Swimming Pool");
  const timelineMonths = baseTimelineMonths(params.floors, params.qualityTier, hasPool);

  const consultationLevel =
    params.qualityTier === "Luxury"    ? "Avora Signature — Full Design & Build" :
    params.qualityTier === "Premium"   ? "Avora Premium — Architectural Direction" :
                                         "Avora Standard — Design Consultation";

  const architectCategories =
    params.qualityTier === "Luxury"  ? ["Luxury Atelier", "Award-Winning Studio", "Design-Led Practice"] :
    params.qualityTier === "Premium" ? ["Premium Regional Studio", "Experienced Practice", "Modern Specialist"] :
                                       ["Cost-Effective Studio", "Efficient Practice", "Regional Specialist"];

  return {
    estimatedConstructionCost: Math.round(totalConstruction),
    architectFeeEstimate:      Math.round(architectFee),
    interiorsEstimate:         Math.round(interiorsCost),
    addOnsCost:                Math.round(addOnsCost + landscapeCost),
    totalEstimatedCost,
    estimatedProjectTimelineMonths: timelineMonths,
    suggestedConsultationLevel: consultationLevel,
    recommendedArchitectCategories: architectCategories,
    builtUpArea: Math.round(builtUpArea),
    psfRate: Math.round(effectivePsf),
    breakdown: {
      structure:  Math.round(structureCost),
      finishing:  Math.round(finishingCost),
      mep:        Math.round(mepCost),
      facade:     Math.round(facadeCost),
      landscape:  Math.round(landscapeCost),
      addOns:     Math.round(addOnsCost),
    },
  };
};
