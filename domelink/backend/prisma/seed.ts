import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateArchitectSeeds } from "./architectSeedData.js";

const prisma = new PrismaClient();

async function seedDemoShowcase(passwordHash: string) {
  console.log("Upserting demo showcase accounts (no user deletion)...");

  const architect = await prisma.user.upsert({
    where: { email: "demo.architect@domelink.com" },
    update: {
      password: passwordHash,
      name: "Demo Architect Studio",
      role: "ARCHITECT",
      isVerified: true,
      isFeatured: true,
      onboardingCompleted: true,
    },
    create: {
      email: "demo.architect@domelink.com",
      password: passwordHash,
      name: "Demo Architect Studio",
      role: "ARCHITECT",
      isVerified: true,
      isFeatured: true,
      location: "Bengaluru, Karnataka",
      city: "Bangalore",
      specialty: "Sustainable Luxury",
      startingPrice: 1500000,
      experience: "12 years",
      teamSize: 8,
      consultationFee: 4999,
      rating: 4.9,
      completedProjects: 85,
      reviewCount: 42,
      trustScore: 95.5,
      designStyles: ["Tropical Modern", "Brutalism", "Indian Contemporary"],
      projectTypes: ["Villa", "Farmhouse", "Penthouse"],
      citiesServed: ["Bengaluru", "Goa", "Hyderabad"],
      servicesOffered: ["COA India", "Full Service Architecture", "Interior Design", "Landscape Integration"],
      about: "A showcase studio demonstrating premium architectural profiles.",
      slug: "demo-architect-studio",
      onboardingCompleted: true,
      heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    },
  });

  const client = await prisma.user.upsert({
    where: { email: "demo.client@domelink.com" },
    update: {
      password: passwordHash,
      name: "Demo Homeowner",
      role: "CLIENT",
      onboardingCompleted: true,
    },
    create: {
      email: "demo.client@domelink.com",
      password: passwordHash,
      name: "Demo Homeowner",
      role: "CLIENT",
      city: "Bengaluru",
      projectType: "Villa",
      plotSize: 2400,
      budgetMin: 8000000,
      budgetMax: 12000000,
      preferredStyles: ["Tropical Modern", "Minimalist"],
      vastuPreference: true,
      timeline: "6 months",
      familySize: 4,
      onboardingCompleted: true,
    },
  });

  const existingEstimate = await prisma.avoraEstimate.findFirst({
    where: { homeownerId: client.id, city: "Bengaluru", status: "completed" },
  });

  if (!existingEstimate) {
    await prisma.avoraEstimate.create({
      data: {
        homeownerId: client.id,
        city: "Bengaluru",
        locationType: "Urban",
        plotSize: 2400,
        builtUpArea: 3200,
        floors: 2,
        timeline: "6 months",
        architectureStyle: "Tropical Modern",
        status: "completed",
        budgetMin: 9000000,
        budgetMax: 11500000,
        report: {
          complexityScore: 7,
          readinessScore: 8,
          architectTier: "Premium Studio",
          costRange: { min: 9000000, max: 11500000 },
          spacePlanning: ["North-facing courtyard", "Double-height living"],
        },
      },
    });
  }

  let consultation = await prisma.consultation.findFirst({
    where: { userId: client.id, architectId: architect.id },
  });

  if (!consultation) {
    consultation = await prisma.consultation.create({
      data: {
        userId: client.id,
        architectId: architect.id,
        message:
          "Looking to build a tropical modern villa in Indiranagar. Required vastu compliance for the entrance.",
        projectType: "Residential Ground-Up",
        budget: 12000000,
        timeline: "6-9 months",
        status: "ACCEPTED",
        amount: 4999,
      },
    });
  }

  const existingProject = await prisma.project.findUnique({
    where: { consultationId: consultation.id },
  });

  if (!existingProject) {
    const project = await prisma.project.create({
      data: {
        consultationId: consultation.id,
        architectId: architect.id,
        homeownerId: client.id,
        title: "Indiranagar Courtyard Residence",
        description: "A benchmark project showcasing communication and milestones.",
        estimatedBudget: 12500000,
        estimatedTime: "12 Months",
        status: "in_progress",
        currentPhase: "Design Development",
        featured: true,
      },
    });

    const milestoneCount = await prisma.projectMilestone.count({
      where: { projectId: project.id },
    });

    if (milestoneCount === 0) {
      await prisma.projectMilestone.createMany({
        data: [
          {
            projectId: project.id,
            title: "Concept Design Approval",
            status: "completed",
            completedAt: new Date(),
          },
          {
            projectId: project.id,
            title: "Structural Planning",
            status: "in_progress",
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
          { projectId: project.id, title: "MEP Layouts", status: "pending" },
        ],
      });
    }
  }

  const demoPortfolio = await prisma.portfolioProject.findFirst({
    where: { architectId: architect.id, title: "Goa Cliff House" },
  });

  if (!demoPortfolio) {
    await prisma.portfolioProject.create({
      data: {
        architectId: architect.id,
        title: "Goa Cliff House",
        description: "Award-winning sustainable design overlooking the Arabian Sea.",
        images: [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
          "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80",
        ],
        location: "Goa",
        year: "2023",
        area: "4,200 sq ft",
        style: "tropical",
        projectType: "Villa",
        featured: true,
      },
    });
  }
}

async function seedIndianArchitects(passwordHash: string) {
  const architects = generateArchitectSeeds();
  console.log(`Seeding ${architects.length} Indian architect profiles...`);

  let created = 0;
  let updated = 0;
  let portfoliosCreated = 0;

  for (let i = 0; i < architects.length; i++) {
    const arch = architects[i];
    if (i > 0 && i % 10 === 0) {
      console.log(`  … ${i}/${architects.length} architects processed`);
    }

    const existing = await prisma.user.findUnique({ where: { email: arch.email } });

    const userData = {
      password: passwordHash,
      name: arch.name,
      role: "ARCHITECT" as const,
      location: arch.location,
      city: arch.city,
      specialty: arch.specialty,
      startingPrice: arch.startingPrice,
      experience: arch.experience,
      teamSize: arch.teamSize,
      heroImage: arch.heroImage,
      profileImage: arch.profileImage,
      about: arch.about,
      slug: arch.slug,
      isVerified: arch.isVerified,
      isFeatured: arch.isFeatured,
      consultationFee: arch.consultationFee,
      rating: arch.rating,
      completedProjects: arch.completedProjects,
      reviewCount: arch.reviewCount,
      trustScore: arch.trustScore,
      designStyles: arch.designStyles,
      projectTypes: arch.projectTypes,
      citiesServed: arch.citiesServed,
      servicesOffered: arch.servicesOffered,
      onboardingCompleted: true,
    };

    const user = await prisma.user.upsert({
      where: { email: arch.email },
      update: userData,
      create: {
        email: arch.email,
        ...userData,
      },
    });

    if (existing) updated++;
    else created++;

    const existingTitles = new Set(
      (
        await prisma.portfolioProject.findMany({
          where: { architectId: user.id },
          select: { title: true },
        })
      ).map((p) => p.title),
    );

    const toCreate = arch.portfolioProjects.filter((p) => !existingTitles.has(p.title));
    if (toCreate.length > 0) {
      await prisma.portfolioProject.createMany({
        data: toCreate.map((proj) => ({
          architectId: user.id,
          title: proj.title,
          description: proj.description,
          images: proj.images,
          location: proj.location,
          year: proj.year,
          area: proj.area,
          style: proj.style,
          projectType: proj.projectType,
          featured: proj.featured,
        })),
      });
      portfoliosCreated += toCreate.length;
    }
  }

  console.log(
    `Architect seed complete: ${created} created, ${updated} updated, ${portfoliosCreated} portfolio projects added.`,
  );
}

async function main() {
  console.log("Starting Prisma seed...");

  const passwordHash = await bcrypt.hash("demo123", 10);

  await seedDemoShowcase(passwordHash);
  await seedIndianArchitects(passwordHash);

  const architectCount = await prisma.user.count({ where: { role: "ARCHITECT" } });
  const portfolioCount = await prisma.portfolioProject.count();

  console.log(`Done. Total architects in DB: ${architectCount}, portfolio projects: ${portfolioCount}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
