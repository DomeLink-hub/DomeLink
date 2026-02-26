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

async function seedDemo() {
  await mongoose.connect(
    process.env.MONGO_URL ||
    process.env.MONGODB_URI ||
    "mongodb+srv://krishnasharmabcgp9_db_user:EqgfqaRuYvPjyYnR@domelink.ihmxibp.mongodb.net/domelink?retryWrites=true&w=majority&appName=domelink"
  );

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
    const admin = await UserModel.create({
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
        area: "3200 sqft"
      }
    ],
    templates: [
      {
        id: "t1",
        name: "Minimalist Starter Home",
        description: "A compact, energy-efficient home template for urban lots.",
        price: 120000
      }
    ],
    experience: "15 years in residential and commercial architecture.",
    teamSize: 8,
    moderationStatus: "approved",
    isVerified: true,
    createdBy: architect._id
  });

  // Create demo project
  const project = await ProjectModel.create({
    owner: homeowner._id,
    architect: architectProfile._id,
    title: "Dream Home Project",
    description: "A modern home design for a family of four.",
    status: "active",
    startDate: new Date(),
  });

  // Notifications
  await NotificationModel.create([
    { user: homeowner._id, type: "system", title: "Welcome!", body: "Your account is ready.", read: false },
    { user: architect._id, type: "project", title: "New Project Assigned", body: "You have a new project.", read: false },
  ]);

  // Reviews

  await ReviewModel.create({
    project: project._id,
    reviewer: homeowner._id,
    reviewee: architect._id,
    rating: 5,
    comment: "Fantastic work!",
  });

  // Demo Consultation
  const ConsultationModel = mongoose.models.Consultation || (await import("../models/Consultation.js")).ConsultationModel;
  const consultation = await ConsultationModel.create({
    userId: homeowner._id,
    architectId: {
      _id: architectProfile._id,
      name: architectProfile.name,
      slug: architectProfile.slug,
      specialty: architectProfile.specialty,
    },
    message: "I'd like to discuss a new project.",
    preferredDate: new Date().toISOString(),
    projectType: "residential",
    budget: 100000,
    plotSize: "2500 sqft",
    preferredStyle: "modern",
    location: "New York",
    status: "active",
    amount: 49,
    createdAt: new Date().toISOString(),
  });

  // Demo ProjectBrief
  const ProjectBriefModel = mongoose.models.ProjectBrief || (await import("../models/ProjectBrief.js")).ProjectBriefModel;
  await ProjectBriefModel.create({
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Payments
  await PaymentModel.create({
    project: project._id,
    payer: homeowner._id,
    payee: architect._id,
    amount: 2500,
    status: "completed",
    method: "card",
  });

  // Files
  await FileModel.create({
    project: project._id,
    uploader: architect._id,
    uploaderModel: "User",
    filename: "blueprint.pdf",
    url: "https://example.com/blueprint.pdf",
    type: "pdf",
    size: 204800,
  });

  // Blog posts
  await BlogPostModel.create({
    author: architect._id,
    authorModel: "User",
    title: "Modern Home Design Trends",
    content: "Explore the latest in modern home design...",
    tags: ["modern", "design", "architecture"],
    published: true,
  });

  // Support tickets
  await SupportTicketModel.create({
    user: homeowner._id,
    architect: architectProfile._id,
    subject: "How do I upload files?",
    message: "I can't find the upload button.",
    status: "open",
  });

  console.log("Demo data seeded.");
  await mongoose.disconnect();
}

seedDemo().catch(e => { console.error(e); process.exit(1); });
