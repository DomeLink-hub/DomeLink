import type { Request, Response } from "express";
import { PrismaClient, Role } from "@prisma/client";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

const prisma = new PrismaClient();

const expertiseOptions = [
  "residential",
  "commercial",
  "interiorDesign",
  "luxuryVillas",
  "sustainableArchitecture",
  "vastuConsultation",
  "farmhouseDesign",
  "apartmentProjects",
] as const;

const styleOptions = [
  "modern",
  "minimalist",
  "contemporary",
  "traditional",
  "luxury",
  "industrial",
  "tropical",
] as const;

const onboardingSchema = z.object({
  firmName: z.string().trim().min(1, "Firm name is required"),
  coaRegistrationNumber: z.string().trim().optional().or(z.literal("")),
  gstNumber: z.string().trim().optional().or(z.literal("")),
  yearsOfExperience: z.coerce.number().int().nonnegative().optional(),
  experience: z.string().trim().min(1, "Experience is required"),
  teamSize: z.coerce.number().int().positive().optional(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().optional().or(z.literal("")),
  serviceCities: z.array(z.string().trim().min(1)).optional(),
  expertise: z.array(z.enum(expertiseOptions)).min(1, "Select at least one expertise"),
  workingStyles: z.array(z.enum(styleOptions)).min(1, "Select at least one design style"),
  consultationFee: z.coerce.number().int().nonnegative().min(1, "Consultation fee is required"),
  startingProjectBudget: z.coerce.number().int().nonnegative().optional(),
  maximumProjectBudget: z.coerce.number().int().nonnegative().optional(),
  onlineConsultation: z.coerce.boolean().optional().default(false),
  offlineConsultation: z.coerce.boolean().optional().default(false),
  siteVisitAvailable: z.coerce.boolean().optional().default(false),
  profilePhoto: z.string().trim().optional().or(z.literal("")),
  heroImage: z.string().trim().optional().or(z.literal("")),
  portfolioImages: z.array(z.string().trim()).optional(),
  awards: z.array(z.string().trim()).optional(),
  certifications: z.array(z.string().trim()).optional(),
  about: z.string().trim().optional().or(z.literal("")),
});

const normalize = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
};

const computeCompletion = (data: Record<string, unknown>) => {
  const sectionScores = {
    professional: ["firmName", "city", "experience"],
    expertise: ["expertise"],
    styles: ["workingStyles"],
    pricing: ["consultationFee", "startingProjectBudget", "maximumProjectBudget"],
    cities: ["serviceCities"],
    availability: ["onlineConsultation", "offlineConsultation", "siteVisitAvailable"],
    portfolio: ["profilePhoto", "heroImage", "portfolioImages", "awards", "certifications"],
  } as const;

  const weight = {
    professional: 20,
    expertise: 15,
    styles: 15,
    pricing: 15,
    cities: 10,
    availability: 10,
    portfolio: 15,
  } as const;

  const scoreFor = (keys: readonly string[]) => {
    const filled = keys.filter((key) => {
      const value = data[key];
      if (typeof value === "boolean") return value;
      if (typeof value === "number") return Number.isFinite(value) && value > 0;
      if (Array.isArray(value)) return value.length > 0;
      return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
    }).length;
    return Math.round((filled / keys.length) * 100);
  };

  const sections = Object.entries(sectionScores).map(([name, keys]) => ({
    name,
    score: scoreFor(keys as readonly string[]),
    weight: weight[name as keyof typeof weight],
  }));

  const weighted = sections.reduce((total, section) => total + (section.score / 100) * section.weight, 0);
  return Math.min(100, Math.round(weighted));
};

const buildArchitectData = (data: Partial<z.infer<typeof onboardingSchema>>, complete: boolean) => {
  const serviceCities = data.serviceCities?.length ? data.serviceCities : data.city ? [data.city] : [];
  const expertise = normalize(data.expertise) as unknown as z.infer<typeof onboardingSchema>["expertise"];
  const workingStyles = normalize(data.workingStyles) as unknown as z.infer<typeof onboardingSchema>["workingStyles"];
  const portfolioImages = normalize(data.portfolioImages);
  const awards = normalize(data.awards);
  const certifications = normalize(data.certifications);

  return {
    firmName: data.firmName ?? undefined,
    coaRegistrationNumber: data.coaRegistrationNumber || undefined,
    gstNumber: data.gstNumber || undefined,
    yearsOfExperience: data.yearsOfExperience ?? undefined,
    experience: data.experience ?? undefined,
    teamSize: data.teamSize ?? undefined,
    city: data.city ?? undefined,
    state: data.state || undefined,
    location: data.city ? (data.state ? `${data.city}, ${data.state}` : data.city) : undefined,
    serviceCities,
    expertise: expertise.length ? expertise : undefined,
    workingStyles: workingStyles.length ? workingStyles : undefined,
    designStyles: workingStyles.length ? workingStyles : undefined,
    servicesOffered: expertise.length ? expertise : undefined,
    consultationFee: data.consultationFee ?? undefined,
    startingProjectBudget: data.startingProjectBudget ?? undefined,
    maximumProjectBudget: data.maximumProjectBudget ?? undefined,
    onlineConsultation: data.onlineConsultation ?? undefined,
    offlineConsultation: data.offlineConsultation ?? undefined,
    siteVisitAvailable: data.siteVisitAvailable ?? undefined,
    profilePhoto: data.profilePhoto || undefined,
    profileImage: data.profilePhoto || undefined,
    heroImage: data.heroImage || undefined,
    portfolioImages: portfolioImages.length ? portfolioImages : undefined,
    awards: awards.length ? awards : undefined,
    certifications: certifications.length ? certifications : undefined,
    about: data.about || undefined,
    specialty: expertise[0] || undefined,
    onboardingCompleted: complete ? true : undefined,
    profileCompletionPercentage: computeCompletion({ ...data, serviceCities: serviceCities.length ? serviceCities : [] }),
  };
};

const selectArchitectOnboarding = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  firmName: true,
  coaRegistrationNumber: true,
  gstNumber: true,
  yearsOfExperience: true,
  experience: true,
  teamSize: true,
  city: true,
  state: true,
  location: true,
  serviceCities: true,
  expertise: true,
  workingStyles: true,
  consultationFee: true,
  startingProjectBudget: true,
  maximumProjectBudget: true,
  onlineConsultation: true,
  offlineConsultation: true,
  siteVisitAvailable: true,
  profilePhoto: true,
  heroImage: true,
  portfolioImages: true,
  awards: true,
  certifications: true,
  profileCompletionPercentage: true,
  onboardingCompleted: true,
  designStyles: true,
  servicesOffered: true,
  specialty: true,
  about: true,
  slug: true,
} as const;

export const getArchitectOnboarding = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const user = await prisma.user.findUnique({ where: { id: userId }, select: selectArchitectOnboarding });
  if (!user || user.role !== Role.ARCHITECT) throw new AppError("Only architects can access onboarding", 403);

  res.status(200).json({ onboarding: user, profileCompletionPercentage: user.profileCompletionPercentage ?? computeCompletion(user as Record<string, unknown>) });
});

export const createArchitectOnboarding = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || user.role !== Role.ARCHITECT) throw new AppError("Only architects can complete onboarding", 403);

  const parsed = onboardingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid architect onboarding payload.",
      issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
  }

  const updateData = buildArchitectData(parsed.data, true);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: selectArchitectOnboarding,
  });

  res.status(201).json({ message: "Architect onboarding completed.", onboarding: updated, profileCompletionPercentage: updated.profileCompletionPercentage });
});

export const updateArchitectOnboarding = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const existing = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!existing || existing.role !== Role.ARCHITECT) throw new AppError("Only architects can complete onboarding", 403);

  const parsed = onboardingSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid architect onboarding payload.",
      issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
  }

  const current = await prisma.user.findUnique({ where: { id: userId }, select: selectArchitectOnboarding });
  if (!current) throw new AppError("Architect profile not found", 404);

  const merged = { ...current, ...parsed.data } as Record<string, unknown>;
  const serviceCities = normalize(parsed.data.serviceCities ?? current.serviceCities);
  const expertise = normalize(parsed.data.expertise ?? current.expertise) as z.infer<typeof onboardingSchema>["expertise"];
  const workingStyles = normalize(parsed.data.workingStyles ?? current.workingStyles) as z.infer<typeof onboardingSchema>["workingStyles"];
  const portfolioImages = normalize(parsed.data.portfolioImages ?? current.portfolioImages);
  const awards = normalize(parsed.data.awards ?? current.awards);
  const certifications = normalize(parsed.data.certifications ?? current.certifications);

  const updated = await prisma.user.update({
    where: { id: userId },
    // Prisma returns nullable fields (string | null) but buildArchitectData expects
    // (string | undefined). Cast through unknown to satisfy the type checker —
    // runtime values are correct; normalize() already handles nulls.
    data: buildArchitectData({
      ...(current as unknown as Partial<z.infer<typeof onboardingSchema>>),
      ...parsed.data,
      serviceCities,
      expertise,
      workingStyles,
      portfolioImages,
      awards,
      certifications,
    }, false),
    select: selectArchitectOnboarding,
  });

  res.status(200).json({ message: "Architect onboarding updated.", onboarding: updated, profileCompletionPercentage: updated.profileCompletionPercentage });
});