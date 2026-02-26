import { connectDatabase } from "../config/db.js";
import { ArchitectModel } from "../models/Architect.js";

const architectsSeed = [
  {
    slug: "elena-vasquez",
    name: "Elena Vasquez",
    location: "Barcelona, Spain",
    specialty: "Mediterranean Modernism",
    rating: 4.9,
    startingPrice: 15000,
    experience: "18 years",
    teamSize: 8,
    about:
      "Elena Vasquez crafts spaces where Mediterranean light becomes the primary material. Her work balances the warmth of traditional Catalan architecture with the clarity of contemporary design, creating homes that breathe with the rhythm of coastal living.",
    heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80",
    profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    projects: [
      { id: "p1", title: "Casa del Mar", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", location: "Sitges", year: "2023", area: "420 m²" },
      { id: "p2", title: "Villa Montserrat", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", location: "Barcelona", year: "2022", area: "380 m²" },
    ],
    templates: [
      { id: "t1", name: "Coastal Retreat", description: "A complete design package for Mediterranean coastal homes", price: 8500 },
      { id: "t2", name: "Urban Terrace", description: "Optimized for city living with outdoor integration", price: 6200 },
    ],
  },
  {
    slug: "james-thornton",
    name: "James Thornton",
    location: "London, United Kingdom",
    specialty: "Adaptive Reuse",
    rating: 4.8,
    startingPrice: 25000,
    experience: "22 years",
    teamSize: 12,
    about:
      "James Thornton specializes in transforming industrial heritage into contemporary living spaces. His practice celebrates the narrative of buildings, weaving historical character with modern comfort.",
    heroImage: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1920&q=80",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    projects: [
      { id: "p1", title: "The Tannery Lofts", image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80", location: "Shoreditch", year: "2023", area: "850 m²" },
      { id: "p2", title: "Chapel House", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80", location: "Cambridge", year: "2022", area: "320 m²" },
    ],
    templates: [
      { id: "t1", name: "Industrial Living", description: "Converting warehouses and factories into homes", price: 12000 },
      { id: "t2", name: "Heritage Blend", description: "Sensitive additions to listed buildings", price: 15000 },
    ],
  },
  {
    slug: "yuki-tanaka",
    name: "Yuki Tanaka",
    location: "Kyoto, Japan",
    specialty: "Minimalist Living",
    rating: 5,
    startingPrice: 20000,
    experience: "15 years",
    teamSize: 5,
    about:
      "Yuki Tanaka's architecture embodies the Japanese philosophy of Ma—the meaningful void. Her homes are meditations in restraint.",
    heroImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1920&q=80",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
    projects: [
      { id: "p1", title: "House of Silence", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", location: "Kyoto", year: "2023", area: "180 m²" },
      { id: "p2", title: "Garden Pavilion", image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80", location: "Osaka", year: "2022", area: "95 m²" },
    ],
    templates: [
      { id: "t1", name: "Zen Core", description: "Essential minimalist residence design", price: 9000 },
      { id: "t2", name: "Garden Integration", description: "Indoor-outdoor flowing spaces", price: 11000 },
    ],
  },
];

const run = async () => {
  await connectDatabase();
  await ArchitectModel.deleteMany({});
  await ArchitectModel.insertMany(architectsSeed);
  console.log(`Seeded ${architectsSeed.length} architects`);
  process.exit(0);
};

run().catch((error) => {
  console.error("Seeding failed", error);
  process.exit(1);
});
