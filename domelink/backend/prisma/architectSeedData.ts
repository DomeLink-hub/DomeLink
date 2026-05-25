/**
 * Seed definitions for 52 Indian architect profiles (Prisma User + PortfolioProject).
 */

export const SEED_CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Jaipur",
  "Ahmedabad",
  "Kolkata",
  "Bhopal",
  "Indore",
  "Surat",
  "Kochi",
  "Chandigarh",
  "Lucknow",
] as const;

export const SEED_SPECIALTIES = [
  "Residential",
  "Luxury Residential",
  "Sustainable Architecture",
  "Vernacular",
  "Interior Design",
  "Commercial",
  "Industrial",
  "Heritage Conservation",
] as const;

export const STYLE_TAG_POOL = [
  "modern",
  "minimalist",
  "traditional",
  "contemporary",
  "vastu",
  "luxury",
  "sustainable",
  "industrial",
  "colonial",
  "tropical",
] as const;

export type VerificationTier = "COA" | "NCARB" | "ARB" | null;

export type ArchitectNameSeed = {
  first: string;
  last: string;
  city: (typeof SEED_CITIES)[number];
};

/** 52 architects — ~3–4 per city, diverse Indian names */
export const ARCHITECT_NAME_SEEDS: ArchitectNameSeed[] = [
  { first: "Priya", last: "Sharma", city: "Mumbai" },
  { first: "Arjun", last: "Mehta", city: "Mumbai" },
  { first: "Fatima", last: "Khan", city: "Mumbai" },
  { first: "Vikram", last: "Desai", city: "Mumbai" },
  { first: "Ananya", last: "Gupta", city: "Delhi" },
  { first: "Rahul", last: "Singh", city: "Delhi" },
  { first: "Zara", last: "Malik", city: "Delhi" },
  { first: "Karan", last: "Chopra", city: "Delhi" },
  { first: "Lakshmi", last: "Narayanan", city: "Bangalore" },
  { first: "Rohan", last: "Iyer", city: "Bangalore" },
  { first: "Deepa", last: "Reddy", city: "Bangalore" },
  { first: "Suresh", last: "Naidu", city: "Bangalore" },
  { first: "Ayesha", last: "Begum", city: "Hyderabad" },
  { first: "Venkat", last: "Rao", city: "Hyderabad" },
  { first: "Meera", last: "Krishnan", city: "Hyderabad" },
  { first: "Imran", last: "Siddiqui", city: "Hyderabad" },
  { first: "Kavya", last: "Subramanian", city: "Chennai" },
  { first: "Arun", last: "Pillai", city: "Chennai" },
  { first: "Divya", last: "Menon", city: "Chennai" },
  { first: "Harpreet", last: "Kaur", city: "Chennai" },
  { first: "Aditya", last: "Joshi", city: "Pune" },
  { first: "Sneha", last: "Patil", city: "Pune" },
  { first: "Nikhil", last: "Kulkarni", city: "Pune" },
  { first: "Pooja", last: "Deshmukh", city: "Pune" },
  { first: "Rajesh", last: "Agarwal", city: "Jaipur" },
  { first: "Naina", last: "Bhandari", city: "Jaipur" },
  { first: "Amit", last: "Verma", city: "Jaipur" },
  { first: "Kiran", last: "Shah", city: "Ahmedabad" },
  { first: "Harsh", last: "Patel", city: "Ahmedabad" },
  { first: "Ishita", last: "Modi", city: "Ahmedabad" },
  { first: "Debashish", last: "Banerjee", city: "Kolkata" },
  { first: "Anjali", last: "Mukherjee", city: "Kolkata" },
  { first: "Sourav", last: "Das", city: "Kolkata" },
  { first: "Ritu", last: "Tiwari", city: "Bhopal" },
  { first: "Manish", last: "Jain", city: "Bhopal" },
  { first: "Pallavi", last: "Shukla", city: "Bhopal" },
  { first: "Vivek", last: "Saxena", city: "Indore" },
  { first: "Neha", last: "Dubey", city: "Indore" },
  { first: "Gaurav", last: "Mishra", city: "Indore" },
  { first: "Jignesh", last: "Thakkar", city: "Surat" },
  { first: "Heena", last: "Gandhi", city: "Surat" },
  { first: "Ramesh", last: "Nair", city: "Kochi" },
  { first: "Anu", last: "Varma", city: "Kochi" },
  { first: "Simran", last: "Kaur", city: "Chandigarh" },
  { first: "Gurpreet", last: "Singh", city: "Chandigarh" },
  { first: "Akash", last: "Yadav", city: "Lucknow" },
  { first: "Shreya", last: "Pandey", city: "Lucknow" },
  { first: "Mohammed", last: "Ansari", city: "Lucknow" },
  { first: "Sanjay", last: "Kapoor", city: "Mumbai" },
  { first: "Revathi", last: "Sundaram", city: "Delhi" },
  { first: "Tarun", last: "Bhatt", city: "Surat" },
  { first: "Leela", last: "Menon", city: "Kochi" },
];

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cd12?w=1200&q=80",
];

const PROFILE_IMAGES = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
];

const PORTFOLIO_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80",
  "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&q=80",
];

export function slugifyName(first: string, last: string): string {
  return `${first}-${last}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function emailFromName(first: string, last: string): string {
  const f = first.toLowerCase().replace(/[^a-z]/g, "");
  const l = last.toLowerCase().replace(/[^a-z]/g, "");
  return `${f}.${l}@domelink-demo.com`;
}

function pickStyleTags(index: number): string[] {
  const count = 2 + (index % 3);
  const tags: string[] = [];
  for (let i = 0; i < count; i++) {
    const tag = STYLE_TAG_POOL[(index + i * 3) % STYLE_TAG_POOL.length];
    if (!tags.includes(tag)) tags.push(tag);
  }
  return tags;
}

function verificationForIndex(index: number): { isVerified: boolean; tier: VerificationTier } {
  const isVerified = index % 10 < 7;
  if (!isVerified) return { isVerified: false, tier: null };
  const tiers: VerificationTier[] = ["COA", "COA", "COA", "NCARB", "ARB"];
  return { isVerified: true, tier: tiers[index % tiers.length] };
}

function tierLabel(tier: VerificationTier): string | null {
  if (tier === "COA") return "COA India";
  if (tier === "NCARB") return "NCARB USA";
  if (tier === "ARB") return "ARB UK";
  return null;
}

function startingPriceForIndex(index: number): number {
  const steps = [5999, 9999, 14999, 24999, 49999, 75000, 99999, 149999, 199999, 225000];
  return steps[index % steps.length];
}

function experienceYears(index: number): number {
  return 2 + (index % 24);
}

function teamSizeForIndex(index: number): number {
  return 1 + (index % 20);
}

function trustScoreForIndex(index: number): number {
  return Math.round((60 + (index * 0.73) % 40) * 10) / 10;
}

function aboutText(
  name: string,
  city: string,
  specialty: string,
  years: number,
  styles: string[],
): string {
  const projectTypes: Record<string, string> = {
    Residential: "courtyard villas and row houses",
    "Luxury Residential": "estate homes and penthouses",
    "Sustainable Architecture": "net-zero and climate-responsive homes",
    Vernacular: "heritage-informed courtyard homes",
    "Interior Design": "full-home interior transformations",
    Commercial: "boutique offices and retail flagship stores",
    Industrial: "warehouses and light manufacturing campuses",
    "Heritage Conservation": "adaptive reuse of colonial and art-deco structures",
  };
  const project = projectTypes[specialty] || "residential commissions";
  return `${name} leads a ${city}-based practice focused on ${specialty.toLowerCase()}, with ${years} years delivering ${project}. Their studio blends ${styles.slice(0, 2).join(" and ")} influences for clients across ${city} and neighbouring regions. Notable work includes phased design-build delivery for discerning families and developer-led plots.`;
}

function projectTypesForSpecialty(specialty: string): string[] {
  const map: Record<string, string[]> = {
    Residential: ["Villa", "Row House", "Apartment"],
    "Luxury Residential": ["Luxury Villa", "Penthouse", "Farmhouse"],
    "Sustainable Architecture": ["Eco Villa", "Green Apartment", "Net-Zero Home"],
    Vernacular: ["Courtyard Home", "Heritage Villa", "Traditional Residence"],
    "Interior Design": ["Interior Renovation", "Luxury Apartment", "Boutique Retail"],
    Commercial: ["Office", "Retail", "Mixed-Use"],
    Industrial: ["Warehouse", "Factory", "Logistics Hub"],
    "Heritage Conservation": ["Heritage Restoration", "Adaptive Reuse", "Museum"],
  };
  return map[specialty] || ["Villa", "Apartment"];
}

function servicesFor(specialty: string, tier: VerificationTier): string[] {
  const base = tierLabel(tier);
  const services: Record<string, string[]> = {
    Residential: ["Concept design", "Construction drawings", "Site supervision"],
    "Luxury Residential": ["Master planning", "Premium specifications", "Project management"],
    "Sustainable Architecture": ["Energy modelling", "Passive design", "Green certification support"],
    Vernacular: ["Context studies", "Local material sourcing", "Craft coordination"],
    "Interior Design": ["Space planning", "FF&E specification", "Styling"],
    Commercial: ["Feasibility studies", "Tenant fit-outs", "MEP coordination"],
    Industrial: ["Master planning", "Structural coordination", "Operational layout"],
    "Heritage Conservation": ["Conservation assessment", "Heritage approvals", "Restoration detailing"],
  };
  const list = services[specialty] || ["Architectural design", "Project coordination"];
  return base ? [base, ...list] : list;
}

export type GeneratedArchitectSeed = {
  email: string;
  slug: string;
  name: string;
  city: string;
  location: string;
  specialty: string;
  designStyles: string[];
  startingPrice: number;
  consultationFee: number;
  experience: string;
  teamSize: number;
  trustScore: number;
  isVerified: boolean;
  verificationTier: VerificationTier;
  about: string;
  heroImage: string;
  profileImage: string;
  projectTypes: string[];
  citiesServed: string[];
  servicesOffered: string[];
  rating: number;
  completedProjects: number;
  reviewCount: number;
  isFeatured: boolean;
  portfolioProjects: Array<{
    title: string;
    location: string;
    year: string;
    area: string;
    description: string;
    style: string;
    projectType: string;
    featured: boolean;
    images: string[];
  }>;
};

const PORTFOLIO_TITLE_PARTS = [
  ["Skyline", "Residence"],
  ["Garden", "Villa"],
  ["Urban", "Retreat"],
  ["Courtyard", "House"],
  ["Terrace", "Home"],
  ["Lakeview", "Estate"],
  ["Heritage", "Restoration"],
  ["Studio", "Loft"],
];

export function generateArchitectSeeds(): GeneratedArchitectSeed[] {
  const usedSlugs = new Set<string>();

  return ARCHITECT_NAME_SEEDS.map((person, index) => {
    const name = `${person.first} ${person.last}`;
    const specialty = SEED_SPECIALTIES[index % SEED_SPECIALTIES.length];
    const designStyles = pickStyleTags(index);
    const years = experienceYears(index);
    const { isVerified, tier } = verificationForIndex(index);

    let slug = slugifyName(person.first, person.last);
    if (usedSlugs.has(slug)) slug = `${slug}-${index + 1}`;
    usedSlugs.add(slug);

    const email = emailFromName(person.first, person.last);
    const stateHint =
      person.city === "Mumbai"
        ? "Maharashtra"
        : person.city === "Delhi"
          ? "NCR"
          : person.city === "Bangalore"
            ? "Karnataka"
            : person.city === "Chennai"
              ? "Tamil Nadu"
              : person.city === "Kolkata"
                ? "West Bengal"
                : person.city === "Kochi"
                  ? "Kerala"
                  : person.city === "Jaipur"
                    ? "Rajasthan"
                    : person.city === "Ahmedabad" || person.city === "Surat"
                      ? "Gujarat"
                      : person.city === "Hyderabad"
                        ? "Telangana"
                        : person.city === "Pune"
                          ? "Maharashtra"
                          : person.city === "Chandigarh"
                            ? "Punjab & Haryana"
                            : person.city === "Lucknow" || person.city === "Bhopal" || person.city === "Indore"
                              ? "Madhya Pradesh"
                              : "India";

    const portfolioCount = 2 + (index % 2);
    const portfolioProjects = Array.from({ length: portfolioCount }, (_, p) => {
      const [a, b] = PORTFOLIO_TITLE_PARTS[(index + p) % PORTFOLIO_TITLE_PARTS.length];
      const year = String(2015 + ((index + p * 2) % 10));
      const areaSqft = 1200 + ((index * 137 + p * 311) % 4800);
      const pt = projectTypesForSpecialty(specialty)[p % projectTypesForSpecialty(specialty).length];
      return {
        title: `${a} ${b}`,
        location: `${person.city}, ${stateHint}`,
        year,
        area: `${areaSqft.toLocaleString("en-IN")} sq ft`,
        description: `A ${designStyles[0]} ${pt.toLowerCase()} delivered in ${person.city}, emphasising ${specialty.toLowerCase()} principles and natural light.`,
        style: designStyles[p % designStyles.length],
        projectType: pt,
        featured: p === 0 && index % 5 === 0,
        images: [
          PORTFOLIO_IMAGES[(index + p) % PORTFOLIO_IMAGES.length],
          PORTFOLIO_IMAGES[(index + p + 1) % PORTFOLIO_IMAGES.length],
        ],
      };
    });

    const startingPrice = startingPriceForIndex(index);

    return {
      email,
      slug,
      name,
      city: person.city,
      location: `${person.city}, ${stateHint}`,
      specialty,
      designStyles,
      startingPrice,
      consultationFee: Math.min(startingPrice, 49999),
      experience: `${years} years`,
      teamSize: teamSizeForIndex(index),
      trustScore: trustScoreForIndex(index),
      isVerified,
      verificationTier: tier,
      about: aboutText(name, person.city, specialty, years, designStyles),
      heroImage: HERO_IMAGES[index % HERO_IMAGES.length],
      profileImage: PROFILE_IMAGES[index % PROFILE_IMAGES.length],
      projectTypes: projectTypesForSpecialty(specialty),
      citiesServed: [person.city],
      servicesOffered: servicesFor(specialty, tier),
      rating: Math.round((3.8 + (trustScoreForIndex(index) / 100) * 1.1) * 10) / 10,
      completedProjects: Math.max(3, years * 4 + (index % 12)),
      reviewCount: Math.max(2, years * 2 + (index % 8)),
      isFeatured: index % 8 === 0,
      portfolioProjects,
    };
  });
}
