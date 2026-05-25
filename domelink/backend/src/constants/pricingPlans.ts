export interface PricingPlanDef {
  id: string;
  name: string;
  priceInr: number;
}

export const PRICING_PLANS: PricingPlanDef[] = [
  { id: "basic", name: "Basic (Mini House)", priceInr: 5999 },
  { id: "standard", name: "Standard", priceInr: 10999 },
  { id: "premium", name: "Premium", priceInr: 19999 },
  { id: "pro-premium", name: "Pro Premium", priceInr: 35000 },
  { id: "premium-class-a", name: "Premium Class A", priceInr: 65000 },
  { id: "premium-class-a-plus", name: "Premium Class A+", priceInr: 125000 },
  { id: "premium-class-s", name: "Premium Class S", priceInr: 225000 },
];

export function resolvePlan(planName: string): PricingPlanDef | undefined {
  const normalized = planName.trim().toLowerCase();
  return PRICING_PLANS.find(
    (p) => p.id === normalized || p.name.toLowerCase() === normalized,
  );
}
