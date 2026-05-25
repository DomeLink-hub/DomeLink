export type PricingGroup = "standard" | "premium";

export interface PricingPlan {
  id: string;
  name: string;
  subtitle: string;
  group: PricingGroup;
  priceInr: number;
  maxSqFt: number;
  perFloorInr: number;
  breakdown: {
    architect: number;
    platform: number;
    support: number;
    marketing: number;
  };
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic (Mini House)",
    subtitle: "Compact plots & starter homes",
    group: "standard",
    priceInr: 5_999,
    maxSqFt: 150,
    perFloorInr: 2_000,
    breakdown: { architect: 3_000, platform: 300, support: 200, marketing: 500 },
  },
  {
    id: "standard",
    name: "Standard",
    subtitle: "Urban row houses & small villas",
    group: "standard",
    priceInr: 10_999,
    maxSqFt: 300,
    perFloorInr: 3_000,
    breakdown: { architect: 6_000, platform: 400, support: 300, marketing: 800 },
  },
  {
    id: "premium",
    name: "Premium",
    subtitle: "Family villas with full design scope",
    group: "standard",
    priceInr: 19_999,
    maxSqFt: 500,
    perFloorInr: 4_000,
    breakdown: { architect: 12_500, platform: 700, support: 800, marketing: 1_500 },
  },
  {
    id: "pro-premium",
    name: "Pro Premium",
    subtitle: "Large-format residences",
    group: "standard",
    priceInr: 35_000,
    maxSqFt: 1_000,
    perFloorInr: 5_000,
    breakdown: { architect: 25_000, platform: 1_000, support: 1_000, marketing: 2_000 },
  },
  {
    id: "premium-class-a",
    name: "Premium Class A",
    subtitle: "Signature estates & gated communities",
    group: "premium",
    priceInr: 65_000,
    maxSqFt: 2_000,
    perFloorInr: 10_000,
    breakdown: { architect: 50_000, platform: 1_500, support: 1_500, marketing: 2_000 },
  },
  {
    id: "premium-class-a-plus",
    name: "Premium Class A+",
    subtitle: "Landmark villas & multi-wing homes",
    group: "premium",
    priceInr: 125_000,
    maxSqFt: 5_000,
    perFloorInr: 20_000,
    breakdown: { architect: 80_000, platform: 5_000, support: 5_000, marketing: 5_000 },
  },
  {
    id: "premium-class-s",
    name: "Premium Class S",
    subtitle: "Ultra-luxury estates & bespoke commissions",
    group: "premium",
    priceInr: 225_000,
    maxSqFt: 10_000,
    perFloorInr: 40_000,
    breakdown: { architect: 140_000, platform: 20_000, support: 10_000, marketing: 10_000 },
  },
];

export const STANDARD_PLANS = PRICING_PLANS.filter((p) => p.group === "standard");
export const PREMIUM_PLANS = PRICING_PLANS.filter((p) => p.group === "premium");

export function getPlanById(planId: string): PricingPlan | undefined {
  return PRICING_PLANS.find((p) => p.id === planId);
}

export function formatPlanInr(amount: number): string {
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

/** Suggest a consultation package from homeowner onboarding plot size (sq ft). */
export function suggestPlanIdFromPlotSize(plotSize?: number | null): string {
  const sqft = plotSize && plotSize > 0 ? plotSize : 300;
  if (sqft <= 150) return "basic";
  if (sqft <= 300) return "standard";
  if (sqft <= 500) return "premium";
  if (sqft <= 1_000) return "pro-premium";
  if (sqft <= 2_000) return "premium-class-a";
  if (sqft <= 5_000) return "premium-class-a-plus";
  return "premium-class-s";
}
