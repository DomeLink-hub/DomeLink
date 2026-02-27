import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/User.js";
import { ArchitectModel } from "../models/Architect.js";
import { ProjectModel } from "../models/Project.js";
import { NotificationModel } from "../models/Notification.js";
import { ReviewModel } from "../models/Review.js";
import { PaymentModel } from "../models/Payment.js";
import { FileModel } from "../models/File.js";
import { BlogPostModel } from "../models/BlogPost.js";
import { SupportTicketModel } from "../models/SupportTicket.js";
import { SavedArchitectModel } from "../models/SavedArchitect.js";
import { PortfolioProjectModel } from "../models/PortfolioProject.js";
import { TeamMemberModel } from "../models/TeamMember.js";
import { TeamInviteModel } from "../models/TeamInvite.js";
import { ChatMessageModel } from "../models/ChatMessage.js";
import { AnalyticsEventModel } from "../models/analytics-event.js";

async function seedDemo() {
  const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }
  await mongoose.connect(mongoUri);

  // Clear collections
  await Promise.all([
    UserModel.deleteMany({}),
    ArchitectModel.deleteMany({}),
    ProjectModel.deleteMany({}),
    NotificationModel.deleteMany({}),
    ReviewModel.deleteMany({}),
    PaymentModel.deleteMany({}),
    FileModel.deleteMany({}),
    BlogPostModel.deleteMany({}),
    SupportTicketModel.deleteMany({}),
    SavedArchitectModel.deleteMany({}),
    PortfolioProjectModel.deleteMany({}),
    TeamMemberModel.deleteMany({}),
    TeamInviteModel.deleteMany({}),
    ChatMessageModel.deleteMany({}),
    AnalyticsEventModel.deleteMany({}),
  ]);

  // Create demo users
    const plainHomeownerPassword = "demopass123";
    const plainArchitectPassword = "demopass123";
    const plainAdminPassword = "demopass123";
    const homeowner = await UserModel.create({
      name: "Demo Homeowner",
      email: "homeowner@demo.com",
      passwordHash: await bcrypt.hash(plainHomeownerPassword, 10),
      role: "homeowner",
      status: "active",
      tokenVersion: 0,
    });
    const architect = await UserModel.create({
      name: "Demo Architect",
      email: "architect@demo.com",
      passwordHash: await bcrypt.hash(plainArchitectPassword, 10),
      role: "architect",
      status: "active",
      tokenVersion: 0,
    });
    await UserModel.create({
      name: "Demo Admin",
      email: "admin@demo.com",
      passwordHash: await bcrypt.hash(plainAdminPassword, 10),
      role: "admin",
      status: "active",
      tokenVersion: 0,
    });

  // Create architect profile
  const architectProfile = await ArchitectModel.create({
    slug: "demo-architect",
    name: "Demo Architect",
    location: "New York",
    styleTags: ["modern", "minimalist"],
    specialty: "Modern Homes",
    rating: 4.9,
    startingPrice: 5000,
    about: "Award-winning architect specializing in modern homes. Over 15 years of experience designing innovative spaces for families and businesses.",
    heroImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200",
    profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
    projects: [
      {
        id: "p1",
        title: "Modern Family Home",
        image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800",
        location: "Brooklyn, NY",
        year: "2022",
        area: "3200 sqft",
      },
      {
        id: "p2",
        title: "SoHo Courtyard Loft",
        image: "https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=800&q=80",
        location: "SoHo, NY",
        year: "2023",
        area: "2800 sqft",
      },
      {
        id: "p3",
        title: "Hudson Ridge Retreat",
        image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80",
        location: "Hudson Valley, NY",
        year: "2024",
        area: "4100 sqft",
      },
    ],
    templates: [
      {
        id: "t1",
        name: "Minimalist Starter Home",
        description: "A compact, energy-efficient home template for urban lots.",
        price: 120000
      },
      {
        id: "t2",
        name: "Courtyard Residence",
        description: "Open-plan modern living with a central garden core.",
        price: 185000,
      },
      {
        id: "t3",
        name: "Ridge Cabin",
        description: "A serene timber retreat with panoramic glazing.",
        price: 140000,
      },
    ],
    experience: "15 years in residential and commercial architecture.",
    teamSize: 8,
    moderationStatus: "approved",
    isVerified: true,
    createdBy: architect._id
  });

  const supplementalArchitects = await ArchitectModel.insertMany([
    {
      slug: "lia-chen",
      name: "Lia Chen",
      location: "San Francisco, CA",
      styleTags: ["contemporary", "minimalist"],
      specialty: "Californian Modern",
      rating: 4.8,
      startingPrice: 8500,
      about: "Lia crafts coastal homes with strong indoor-outdoor flow and luminous material palettes.",
      heroImage: "https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1200&q=80",
      profileImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80",
      projects: [
        { id: "lia-p1", title: "Golden Gate View", image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80", location: "Marin", year: "2023", area: "3600 sqft" },
        { id: "lia-p2", title: "Pacific Courtyard", image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80", location: "Sausalito", year: "2022", area: "3000 sqft" },
      ],
      templates: [
        { id: "lia-t1", name: "Bay Modern Kit", description: "Warm minimalism for hillside plots.", price: 9800 },
      ],
      experience: "12 years in modern residential design.",
      teamSize: 6,
      moderationStatus: "approved",
      isVerified: true,
    },
    {
      slug: "marco-silva",
      name: "Marco Silva",
      location: "Austin, TX",
      styleTags: ["industrial", "modern"],
      specialty: "Industrial Residential",
      rating: 4.7,
      startingPrice: 6200,
      about: "Marco blends raw textures with precision detailing for high-performance homes.",
      heroImage: "https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1200&q=80",
      profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
      projects: [
        { id: "marco-p1", title: "Ironwood House", image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80", location: "Austin", year: "2021", area: "2900 sqft" },
      ],
      templates: [
        { id: "marco-t1", name: "Steel Frame Loft", description: "Loft-forward living with adaptable cores.", price: 7800 },
      ],
      experience: "10 years in mixed-use residential.",
      teamSize: 4,
      moderationStatus: "approved",
      isVerified: true,
    },
    {
      slug: "amara-novak",
      name: "Amara Novak",
      location: "Chicago, IL",
      styleTags: ["scandinavian", "minimalist"],
      specialty: "Nordic Serenity",
      rating: 5,
      startingPrice: 10500,
      about: "Amara designs calm, tactile homes that prioritize wellness and daylight.",
      heroImage: "https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1200&q=80",
      profileImage: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400&q=80",
      projects: [
        { id: "amara-p1", title: "Northlight Residence", image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80", location: "Evanston", year: "2024", area: "3400 sqft" },
      ],
      templates: [
        { id: "amara-t1", name: "Nordic Shell", description: "Minimalist envelope with flexible interiors.", price: 11200 },
      ],
      experience: "14 years in Scandinavian-inspired homes.",
      teamSize: 7,
      moderationStatus: "approved",
      isVerified: true,
    },
  ]);

  const [liaProfile, marcoProfile, amaraProfile] = supplementalArchitects;

  const project = await ProjectModel.create({
    owner: homeowner._id,
    architect: architectProfile._id,
    title: "Dream Home Project",
    description: "A modern home design for a family of four.",
    status: "active",
    startDate: new Date(),
  });

  const projectExpansion = await ProjectModel.create({
    owner: homeowner._id,
    architect: liaProfile._id,
    title: "Coastal Courtyard Home",
    description: "A warm, airy retreat designed around a central courtyard.",
    status: "active",
    startDate: new Date(),
  });

  const projectCompleted = await ProjectModel.create({
    owner: homeowner._id,
    architect: architectProfile._id,
    title: "Hudson Ridge Retreat",
    description: "Completed concept-to-construction delivery with premium finishes.",
    status: "completed",
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 210),
    endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
  });

  const daysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  await NotificationModel.create([
    { user: homeowner._id, type: "system", title: "Welcome to DomeLink", body: "Your homeowner workspace is ready.", read: false, createdAt: daysAgo(1) },
    { user: homeowner._id, type: "message", title: "New architect reply", body: "Demo Architect shared early concepts for review.", read: false, createdAt: daysAgo(2) },
    { user: homeowner._id, type: "project", title: "Brief updated", body: "Your project brief moved to In Progress.", read: true, createdAt: daysAgo(4) },
    { user: homeowner._id, type: "review", title: "Review requested", body: "Share feedback on your latest consultation.", read: true, createdAt: daysAgo(6) },
    { user: homeowner._id, type: "system", title: "AI insight ready", body: "New cost alignment insights are available.", read: false, createdAt: daysAgo(8) },
    { user: architect._id, type: "project", title: "New project assigned", body: "A premium homeowner requested a consultation.", read: false, createdAt: daysAgo(1) },
    { user: architect._id, type: "message", title: "Client response", body: "Demo Homeowner approved the moodboard direction.", read: false, createdAt: daysAgo(3) },
    { user: architect._id, type: "review", title: "New review posted", body: "You received a 5-star review.", read: true, createdAt: daysAgo(5) },
    { user: architect._id, type: "system", title: "Portfolio spotlight", body: "Your latest project is trending in Explore.", read: true, createdAt: daysAgo(7) },
  ]);

  // Reviews

  await ReviewModel.create([
    {
      project: project._id,
      reviewer: homeowner._id,
      reviewee: architectProfile._id,
      rating: 5,
      comment: "Fantastic work! The spatial planning feels calm and intentional.",
      createdAt: daysAgo(7),
    },
    {
      project: projectExpansion._id,
      reviewer: homeowner._id,
      reviewee: architectProfile._id,
      rating: 4,
      comment: "Loved the concept options and material palette guidance.",
      createdAt: daysAgo(2),
    },
  ]);

  // Demo Consultation
  const ConsultationModel = mongoose.models.Consultation || (await import("../models/Consultation.js")).ConsultationModel;
  const consultations = await ConsultationModel.insertMany([
    {
      userId: homeowner._id,
      architectId: architectProfile._id,
      message: "I'd like to discuss a new project focused on natural light.",
      preferredDate: new Date().toISOString(),
      projectType: "residential",
      budget: 160000,
      plotSize: "2500 sqft",
      preferredStyle: "modern",
      location: "New York",
      status: "active",
      amount: 79,
      createdAt: daysAgo(1),
    },
    {
      userId: homeowner._id,
      architectId: architectProfile._id,
      message: "Need a materials study for a ridge home renovation.",
      preferredDate: new Date().toISOString(),
      projectType: "residential",
      budget: 220000,
      plotSize: "3800 sqft",
      preferredStyle: "minimalist",
      location: "Hudson Valley",
      status: "accepted",
      amount: 120,
      createdAt: daysAgo(6),
    },
    {
      userId: homeowner._id,
      architectId: architectProfile._id,
      message: "Looking for a rapid concept review on a modern addition.",
      preferredDate: new Date().toISOString(),
      projectType: "residential",
      budget: 90000,
      plotSize: "1800 sqft",
      preferredStyle: "contemporary",
      location: "Brooklyn",
      status: "completed",
      amount: 65,
      createdAt: daysAgo(12),
    },
    {
      userId: homeowner._id,
      architectId: liaProfile._id,
      message: "Exploring a coastal retreat concept with a courtyard focus.",
      preferredDate: new Date().toISOString(),
      projectType: "residential",
      budget: 190000,
      plotSize: "3000 sqft",
      preferredStyle: "minimalist",
      location: "Sausalito",
      status: "pending",
      amount: 55,
      createdAt: daysAgo(3),
    },
  ]);

  // Demo ProjectBrief
  const ProjectBriefModel = mongoose.models.ProjectBrief || (await import("../models/ProjectBrief.js")).ProjectBriefModel;
  await ProjectBriefModel.insertMany([
    {
      homeownerId: homeowner._id,
      projectName: "Demo Family Home",
      projectType: "residential",
      plotSize: "2500 sqft",
      budget: "100000",
      location: "New York",
      stylePreferences: ["modern", "minimalist"],
      timeline: "6 months",
      requirements: "Open plan, energy efficient, 4 bedrooms",
      inspirationImages: ["https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800"],
      status: "submitted",
      createdAt: daysAgo(10),
      updatedAt: daysAgo(7),
    },
    {
      homeownerId: homeowner._id,
      projectName: "Hudson Ridge Retreat",
      projectType: "residential",
      plotSize: "3800 sqft",
      budget: "220000",
      location: "Hudson Valley",
      stylePreferences: ["scandinavian", "minimalist"],
      timeline: "9 months",
      requirements: "Timber palette, panoramic glazing, wellness spa suite",
      inspirationImages: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80"],
      status: "in_progress",
      createdAt: daysAgo(18),
      updatedAt: daysAgo(4),
    },
    {
      homeownerId: homeowner._id,
      projectName: "SoHo Loft Refresh",
      projectType: "interior",
      plotSize: "1800 sqft",
      budget: "85000",
      location: "SoHo, NY",
      stylePreferences: ["industrial", "modern"],
      timeline: "3 months",
      requirements: "Kitchen reflow, lighting study, gallery walls",
      inspirationImages: ["https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=800&q=80"],
      status: "completed",
      createdAt: daysAgo(35),
      updatedAt: daysAgo(14),
    },
    {
      homeownerId: homeowner._id,
      projectName: "Coastal Courtyard Home",
      projectType: "residential",
      plotSize: "3000 sqft",
      budget: "190000",
      location: "Sausalito, CA",
      stylePreferences: ["contemporary"],
      timeline: "8 months",
      requirements: "Courtyard living, indoor-outdoor kitchen, soft material palette",
      inspirationImages: ["https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80"],
      status: "draft",
      createdAt: daysAgo(3),
      updatedAt: daysAgo(1),
    },
  ]);

  // Payments
  await PaymentModel.create([
    { project: project._id, payer: homeowner._id, payee: architect._id, amount: 2500, status: "completed", method: "card", createdAt: daysAgo(9) },
    { project: projectExpansion._id, payer: homeowner._id, payee: architect._id, amount: 1800, status: "completed", method: "bank", createdAt: daysAgo(4) },
    { project: projectCompleted._id, payer: homeowner._id, payee: architect._id, amount: 4200, status: "completed", method: "card", createdAt: daysAgo(19) },
    { project: project._id, payer: homeowner._id, payee: architect._id, amount: 980, status: "pending", method: "card", createdAt: daysAgo(1) },
  ]);

  // Files
  await FileModel.create([
    { project: project._id, uploader: architect._id, uploaderModel: "User", filename: "blueprint.pdf", url: "https://example.com/blueprint.pdf", type: "pdf", size: 204800, createdAt: daysAgo(6) },
    { project: project._id, uploader: architect._id, uploaderModel: "User", filename: "moodboard.pdf", url: "https://example.com/moodboard.pdf", type: "pdf", size: 104800, createdAt: daysAgo(3) },
    { project: projectExpansion._id, uploader: architect._id, uploaderModel: "User", filename: "site-analysis.pdf", url: "https://example.com/site-analysis.pdf", type: "pdf", size: 164800, createdAt: daysAgo(2) },
  ]);

  // Blog posts
  await BlogPostModel.create([
    {
      author: architect._id,
      authorModel: "User",
      title: "Modern Home Design Trends",
      content: "Explore the latest in modern home design with a focus on calm materials and clean geometry.",
      tags: ["modern", "design", "architecture"],
      published: true,
      createdAt: daysAgo(16),
    },
    {
      author: architect._id,
      authorModel: "User",
      title: "Lighting as Architecture",
      content: "How to shape daylight through structure, screens, and soft edges.",
      tags: ["lighting", "architecture"],
      published: true,
      createdAt: daysAgo(5),
    },
  ]);

  // Support tickets
  await SupportTicketModel.create([
    {
      user: homeowner._id,
      architect: architectProfile._id,
      subject: "How do I upload files?",
      message: "I can't find the upload button.",
      status: "open",
      createdAt: daysAgo(8),
    },
    {
      user: homeowner._id,
      architect: architectProfile._id,
      subject: "Payment confirmation needed",
      message: "Can you confirm the deposit was received?",
      status: "pending",
      createdAt: daysAgo(2),
    },
  ]);

  await SavedArchitectModel.create([
    { userId: homeowner._id, architectId: architectProfile._id, createdAt: daysAgo(12) },
    { userId: homeowner._id, architectId: liaProfile._id, createdAt: daysAgo(5) },
    { userId: homeowner._id, architectId: marcoProfile._id, createdAt: daysAgo(3) },
  ]);

  await PortfolioProjectModel.create([
    {
      architectId: architectProfile._id,
      title: "Harborline Residence",
      images: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80"],
      description: "An oceanfront retreat that balances stone massing with warm timber interiors.",
      location: "Long Island, NY",
      year: "2024",
      area: "4400 sqft",
      createdAt: daysAgo(20),
    },
    {
      architectId: architectProfile._id,
      title: "Tribeca Courtyard",
      images: ["https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1200&q=80"],
      description: "A courtyard home sculpted for layered daylight and privacy.",
      location: "Tribeca, NY",
      year: "2023",
      area: "3100 sqft",
      createdAt: daysAgo(12),
    },
    {
      architectId: architectProfile._id,
      title: "Ridgecrest Pavilion",
      images: ["https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&q=80"],
      description: "A mountain pavilion with panoramic glazing and acoustic timber.",
      location: "Catskills, NY",
      year: "2022",
      area: "5200 sqft",
      createdAt: daysAgo(30),
    },
  ]);

  await TeamMemberModel.create([
    { architectId: architectProfile._id, name: "Elena Vasquez", email: "elena@studio.com", role: "Design Lead", avatar: "https://randomuser.me/api/portraits/women/32.jpg", status: "online", createdAt: daysAgo(40), updatedAt: daysAgo(1) },
    { architectId: architectProfile._id, name: "Carlos Mendez", email: "carlos@studio.com", role: "Visualization", avatar: "https://randomuser.me/api/portraits/men/44.jpg", status: "away", createdAt: daysAgo(30), updatedAt: daysAgo(2) },
    { architectId: architectProfile._id, name: "Maria Santos", email: "maria@studio.com", role: "Project Manager", avatar: "https://randomuser.me/api/portraits/women/65.jpg", status: "offline", createdAt: daysAgo(22), updatedAt: daysAgo(4) },
  ]);

  await TeamInviteModel.create([
    {
      architectId: architectProfile._id,
      email: "junior@studio.com",
      role: "Junior Architect",
      token: new mongoose.Types.ObjectId().toString(),
      invitedBy: architect._id,
      status: "pending",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    {
      architectId: architectProfile._id,
      email: "pm@studio.com",
      role: "Project Coordinator",
      token: new mongoose.Types.ObjectId().toString(),
      invitedBy: architect._id,
      status: "pending",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8),
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
  ]);

  await ChatMessageModel.insertMany([
    {
      consultationId: consultations[0]._id,
      senderId: homeowner._id,
      message: "Hi! I want a calm, light-filled family home with a shared courtyard.",
      timestamp: daysAgo(1),
      readBy: [{ userId: architect._id, readAt: daysAgo(1) }],
    },
    {
      consultationId: consultations[0]._id,
      senderId: architect._id,
      message: "Understood. I’ll share two massing options and a material palette this week.",
      timestamp: daysAgo(1),
      readBy: [{ userId: homeowner._id, readAt: daysAgo(1) }],
    },
    {
      consultationId: consultations[1]._id,
      senderId: homeowner._id,
      message: "Can we prioritize timber and blackened steel with a warm interior finish?",
      timestamp: daysAgo(6),
      readBy: [{ userId: architect._id, readAt: daysAgo(5) }],
    },
    {
      consultationId: consultations[1]._id,
      senderId: architect._id,
      message: "Absolutely. I’ll align materials with your budget and send a moodboard.",
      timestamp: daysAgo(5),
      readBy: [{ userId: homeowner._id, readAt: daysAgo(4) }],
    },
    {
      consultationId: consultations[2]._id,
      senderId: architect._id,
      message: "Final concept approved. Deliverables are now archived in Files.",
      timestamp: daysAgo(11),
      readBy: [{ userId: homeowner._id, readAt: daysAgo(11) }],
    },
    {
      consultationId: consultations[3]._id,
      senderId: homeowner._id,
      message: "I’m exploring a coastal courtyard home with a calm, airy feel.",
      timestamp: daysAgo(3),
      readBy: [{ userId: architect._id, readAt: daysAgo(2) }],
    },
  ]);

  const analyticsEvents = Array.from({ length: 28 }).flatMap((_, index) => {
    const createdAt = daysAgo(28 - index);
    return [
      { userId: homeowner._id, event: "search_filter", metadata: { location: "New York", budgetMax: 200000 }, createdAt },
      { userId: homeowner._id, event: "save", metadata: { architectId: String(architectProfile._id) }, createdAt },
      { userId: homeowner._id, event: "consultation_start", metadata: { architectId: String(architectProfile._id) }, createdAt },
      { userId: architect._id, event: "profile_view", metadata: { architectId: String(architectProfile._id) }, createdAt },
    ];
  });

  await AnalyticsEventModel.insertMany(analyticsEvents);

  console.log("Demo data seeded.");
  await mongoose.disconnect();
}

seedDemo().catch(e => { console.error(e); process.exit(1); });
