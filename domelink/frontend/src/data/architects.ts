export interface Project {
  id: string;
  title: string;
  image: string;
  location: string;
  year: string;
  area?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Architect {
  id: string;
  slug: string;
  name: string;
  location: string;
  specialty: string;
  rating: number;
  startingPrice: number;
  about: string;
  heroImage: string;
  profileImage: string;
  projects: Project[];
  templates: Template[];
  experience: string;
  teamSize: number;
}

export const architects: Architect[] = [
  {
    id: "1",
    slug: "elena-vasquez",
    name: "Elena Vasquez",
    location: "Barcelona, Spain",
    specialty: "Mediterranean Modernism",
    rating: 4.9,
    startingPrice: 15000,
    experience: "18 years",
    teamSize: 8,
    about: "Elena Vasquez crafts spaces where Mediterranean light becomes the primary material. Her work balances the warmth of traditional Catalan architecture with the clarity of contemporary design, creating homes that breathe with the rhythm of coastal living.",
    heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80",
    profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    projects: [
      { id: "p1", title: "Casa del Mar", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", location: "Sitges", year: "2023", area: "420 m²" },
      { id: "p2", title: "Villa Montserrat", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", location: "Barcelona", year: "2022", area: "380 m²" },
      { id: "p3", title: "The Stone Garden", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80", location: "Girona", year: "2021", area: "290 m²" },
    ],
    templates: [
      { id: "t1", name: "Coastal Retreat", description: "A complete design package for Mediterranean coastal homes", price: 8500 },
      { id: "t2", name: "Urban Terrace", description: "Optimized for city living with outdoor integration", price: 6200 },
    ],
  },
  {
    id: "2",
    slug: "james-thornton",
    name: "James Thornton",
    location: "London, United Kingdom",
    specialty: "Adaptive Reuse",
    rating: 4.8,
    startingPrice: 25000,
    experience: "22 years",
    teamSize: 12,
    about: "James Thornton specializes in transforming industrial heritage into contemporary living spaces. His practice celebrates the narrative of buildings, weaving historical character with modern comfort in ways that honor both past and future inhabitants.",
    heroImage: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1920&q=80",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    projects: [
      { id: "p1", title: "The Tannery Lofts", image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80", location: "Shoreditch", year: "2023", area: "850 m²" },
      { id: "p2", title: "Chapel House", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80", location: "Cambridge", year: "2022", area: "320 m²" },
      { id: "p3", title: "Mill Conversion", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80", location: "Manchester", year: "2021", area: "1200 m²" },
    ],
    templates: [
      { id: "t1", name: "Industrial Living", description: "Converting warehouses and factories into homes", price: 12000 },
      { id: "t2", name: "Heritage Blend", description: "Sensitive additions to listed buildings", price: 15000 },
    ],
  },
  {
    id: "3",
    slug: "yuki-tanaka",
    name: "Yuki Tanaka",
    location: "Kyoto, Japan",
    specialty: "Minimalist Living",
    rating: 5.0,
    startingPrice: 20000,
    experience: "15 years",
    teamSize: 5,
    about: "Yuki Tanaka's architecture embodies the Japanese philosophy of Ma—the meaningful void. Her homes are meditations in restraint, where every element earns its place and empty space speaks as loudly as form.",
    heroImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1920&q=80",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
    projects: [
      { id: "p1", title: "House of Silence", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", location: "Kyoto", year: "2023", area: "180 m²" },
      { id: "p2", title: "Garden Pavilion", image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80", location: "Osaka", year: "2022", area: "95 m²" },
      { id: "p3", title: "Tea Master's Home", image: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80", location: "Nara", year: "2021", area: "140 m²" },
    ],
    templates: [
      { id: "t1", name: "Zen Core", description: "Essential minimalist residence design", price: 9000 },
      { id: "t2", name: "Garden Integration", description: "Indoor-outdoor flowing spaces", price: 11000 },
    ],
  },
  {
    id: "4",
    slug: "marcus-sterling",
    name: "Marcus Sterling",
    location: "New York, USA",
    specialty: "Urban Luxury",
    rating: 4.7,
    startingPrice: 50000,
    experience: "20 years",
    teamSize: 18,
    about: "Marcus Sterling creates residences for those who demand excellence without ostentation. His New York practice delivers sophisticated urban homes where luxury is expressed through proportion, material quality, and the choreography of daily life.",
    heroImage: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1920&q=80",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    projects: [
      { id: "p1", title: "Upper East Penthouse", image: "https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?w=800&q=80", location: "Manhattan", year: "2023", area: "650 m²" },
      { id: "p2", title: "Hudson Yards Residence", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80", location: "Manhattan", year: "2022", area: "420 m²" },
      { id: "p3", title: "Brooklyn Heights Townhouse", image: "https://images.unsplash.com/photo-1600566753104-685f4f24cb4d?w=800&q=80", location: "Brooklyn", year: "2021", area: "380 m²" },
    ],
    templates: [
      { id: "t1", name: "Manhattan Premium", description: "High-end urban apartment renovation", price: 25000 },
      { id: "t2", name: "Townhouse Classic", description: "Full brownstone transformation", price: 35000 },
    ],
  },
  {
    id: "5",
    slug: "sofia-andersson",
    name: "Sofia Andersson",
    location: "Stockholm, Sweden",
    specialty: "Scandinavian Warmth",
    rating: 4.9,
    startingPrice: 18000,
    experience: "12 years",
    teamSize: 6,
    about: "Sofia Andersson designs homes that embrace the Nordic light. Her architecture combines the functional beauty of Scandinavian tradition with contemporary innovation, creating spaces that comfort through long winters and celebrate the endless summer days.",
    heroImage: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&q=80",
    profileImage: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&q=80",
    projects: [
      { id: "p1", title: "Light House", image: "https://images.unsplash.com/photo-1600566752227-cac0899fcd0e?w=800&q=80", location: "Stockholm", year: "2023", area: "240 m²" },
      { id: "p2", title: "Forest Retreat", image: "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&q=80", location: "Uppsala", year: "2022", area: "180 m²" },
      { id: "p3", title: "Coastal Cabin", image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80", location: "Gothenburg", year: "2021", area: "120 m²" },
    ],
    templates: [
      { id: "t1", name: "Nordic Light", description: "Maximizing natural light in northern climates", price: 8000 },
      { id: "t2", name: "Hygge Home", description: "Cozy, functional family residences", price: 10000 },
    ],
  },
  {
    id: "6",
    slug: "omar-hassan",
    name: "Omar Hassan",
    location: "Dubai, UAE",
    specialty: "Desert Contemporary",
    rating: 4.8,
    startingPrice: 45000,
    experience: "16 years",
    teamSize: 14,
    about: "Omar Hassan draws inspiration from traditional Arabian architecture while pushing contemporary boundaries. His homes are designed for the desert climate, combining sustainable cooling strategies with the grandeur expected of Gulf residences.",
    heroImage: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=1920&q=80",
    profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
    projects: [
      { id: "p1", title: "Desert Oasis Villa", image: "https://images.unsplash.com/photo-1600566752734-2a0e4f23c887?w=800&q=80", location: "Dubai", year: "2023", area: "1200 m²" },
      { id: "p2", title: "Palm Residence", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", location: "Dubai", year: "2022", area: "850 m²" },
      { id: "p3", title: "Courtyard House", image: "https://images.unsplash.com/photo-1600607687654-b4f8b31a0bc3?w=800&q=80", location: "Abu Dhabi", year: "2021", area: "680 m²" },
    ],
    templates: [
      { id: "t1", name: "Desert Luxury", description: "Climate-responsive luxury villa design", price: 22000 },
      { id: "t2", name: "Modern Majlis", description: "Contemporary Arabic entertaining spaces", price: 18000 },
    ],
  },
  {
    id: "7",
    slug: "claire-dubois",
    name: "Claire Dubois",
    location: "Paris, France",
    specialty: "Parisian Renovation",
    rating: 4.9,
    startingPrice: 22000,
    experience: "19 years",
    teamSize: 9,
    about: "Claire Dubois breathes new life into Haussmannian apartments while honoring their heritage. Her practice specializes in the delicate art of modernizing Parisian interiors, preserving the poetry of moldings and parquet while introducing contemporary functionality.",
    heroImage: "https://images.unsplash.com/photo-1600566752229-250ed79470f8?w=1920&q=80",
    profileImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80",
    projects: [
      { id: "p1", title: "Marais Apartment", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80", location: "Paris 4e", year: "2023", area: "185 m²" },
      { id: "p2", title: "Saint-Germain Duplex", image: "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800&q=80", location: "Paris 6e", year: "2022", area: "220 m²" },
      { id: "p3", title: "Trocadéro Residence", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", location: "Paris 16e", year: "2021", area: "340 m²" },
    ],
    templates: [
      { id: "t1", name: "Haussmann Revival", description: "Modernizing classic Parisian apartments", price: 14000 },
      { id: "t2", name: "Atelier Living", description: "Converting artist studios into homes", price: 12000 },
    ],
  },
  {
    id: "8",
    slug: "daniel-costa",
    name: "Daniel Costa",
    location: "São Paulo, Brazil",
    specialty: "Tropical Modernism",
    rating: 4.7,
    startingPrice: 16000,
    experience: "14 years",
    teamSize: 7,
    about: "Daniel Costa continues the legacy of Brazilian modernism with contemporary interpretations. His architecture embraces the lush tropical environment, creating homes that blur the boundary between interior and exterior, living and garden.",
    heroImage: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1920&q=80",
    profileImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
    projects: [
      { id: "p1", title: "Garden House", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", location: "São Paulo", year: "2023", area: "450 m²" },
      { id: "p2", title: "Coastal Pavilion", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", location: "Guarujá", year: "2022", area: "380 m²" },
      { id: "p3", title: "Mountain Retreat", image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80", location: "Campos do Jordão", year: "2021", area: "290 m²" },
    ],
    templates: [
      { id: "t1", name: "Tropical Flow", description: "Indoor-outdoor tropical living design", price: 9500 },
      { id: "t2", name: "Urban Jungle", description: "Green integration for city homes", price: 7800 },
    ],
  },
  {
    id: "9",
    slug: "anna-kowalski",
    name: "Anna Kowalski",
    location: "Berlin, Germany",
    specialty: "Sustainable Design",
    rating: 4.8,
    startingPrice: 19000,
    experience: "11 years",
    teamSize: 8,
    about: "Anna Kowalski proves that sustainability and beauty are inseparable. Her practice leads in passive house design and circular material use, creating homes that tread lightly on the earth while providing exceptional comfort and aesthetic pleasure.",
    heroImage: "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1920&q=80",
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    projects: [
      { id: "p1", title: "Zero Energy House", image: "https://images.unsplash.com/photo-1600566752734-2a0e4f23c887?w=800&q=80", location: "Berlin", year: "2023", area: "210 m²" },
      { id: "p2", title: "Reclaimed Materials Home", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80", location: "Potsdam", year: "2022", area: "175 m²" },
      { id: "p3", title: "Passive Solar Villa", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80", location: "Munich", year: "2021", area: "280 m²" },
    ],
    templates: [
      { id: "t1", name: "Passive House", description: "Ultra-low energy residential design", price: 11000 },
      { id: "t2", name: "Circular Home", description: "Design using reclaimed materials", price: 9500 },
    ],
  },
  {
    id: "10",
    slug: "raj-patel",
    name: "Raj Patel",
    location: "Mumbai, India",
    specialty: "Compact Living",
    rating: 4.6,
    startingPrice: 12000,
    experience: "17 years",
    teamSize: 11,
    about: "Raj Patel is a master of maximizing space without sacrificing soul. His Mumbai practice creates homes that work beautifully within the constraints of urban density, proving that thoughtful design can make any space feel generous.",
    heroImage: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1920&q=80",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    projects: [
      { id: "p1", title: "Sea View Apartment", image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80", location: "Mumbai", year: "2023", area: "95 m²" },
      { id: "p2", title: "Heritage Flat", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", location: "Mumbai", year: "2022", area: "120 m²" },
      { id: "p3", title: "Terrace Home", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", location: "Pune", year: "2021", area: "180 m²" },
    ],
    templates: [
      { id: "t1", name: "Urban Compact", description: "Maximizing small urban spaces", price: 6500 },
      { id: "t2", name: "Multi-Gen Living", description: "Designs for extended family homes", price: 8500 },
    ],
  },
];

export const getArchitectBySlug = (slug: string): Architect | undefined => {
  return architects.find((a) => a.slug === slug);
};

export const filterArchitects = (
  minRating?: number,
  minBudget?: number,
  maxBudget?: number,
  plotSize?: string
): Architect[] => {
  return architects.filter((architect) => {
    if (minRating && architect.rating < minRating) return false;
    if (minBudget && architect.startingPrice < minBudget) return false;
    if (maxBudget && architect.startingPrice > maxBudget) return false;
    return true;
  });
};
