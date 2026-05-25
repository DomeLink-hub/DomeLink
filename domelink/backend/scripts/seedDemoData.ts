// backend/scripts/seedDemoData.ts
// Run with: npx ts-node backend/scripts/seedDemoData.ts


import mongoose, { Types } from 'mongoose';
import { UserModel } from '../src/models/User';
import { ArchitectModel } from '../src/models/Architect';
import { ProjectModel } from '../src/models/Project';
import { NotificationModel } from '../src/models/Notification';
import { ReviewModel } from '../src/models/Review';
import { PaymentModel } from '../src/models/Payment';
import { SupportTicketModel } from '../src/models/SupportTicket';
import { ConsultationModel } from '../src/models/Consultation';
import { ChatMessageModel } from '../src/models/ChatMessage';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/domelink';


async function seed() {
  await mongoose.connect(MONGO_URI);

  // Clear existing data
  await Promise.all([
    UserModel.deleteMany({}),
    ArchitectModel.deleteMany({}),
    ProjectModel.deleteMany({}),
    NotificationModel.deleteMany({}),
    ReviewModel.deleteMany({}),
    PaymentModel.deleteMany({}),
    SupportTicketModel.deleteMany({}),
    ConsultationModel.deleteMany({}),
    ChatMessageModel.deleteMany({}),
  ]);

  // Create demo users
  const demoHomeowner = await UserModel.create({
    name: 'Demo Homeowner',
    email: 'demo.homeowner@domelink.com',
    passwordHash: 'demo',
    role: 'homeowner',
    status: 'active',
    tokenVersion: 0,
    styleTags: ['modern', 'minimal', 'courtyard'],
  });
  const demoArchitect = await UserModel.create({
    name: 'Demo Architect',
    email: 'demo.architect@domelink.com',
    passwordHash: 'demo',
    role: 'architect',
    status: 'active',
    tokenVersion: 0,
    styleTags: ['contemporary', 'eco', 'indian modern'],
  });

  // Create demo architect profile
  const architectProfile = await ArchitectModel.create({
    slug: 'demo-architect',
    name: 'Demo Architect',
    location: 'Bengaluru, Karnataka',
    styleTags: ['contemporary', 'eco', 'courtyard'],
    specialty: 'Residential',
    rating: 4.8,
    startingPrice: 750000,
    consultationFee: 25000,
    about: 'Award-winning architect specializing in sustainable Indian homes and premium renovation projects.',
    heroImage: '/images/architect-hero.jpg',
    profileImage: '/images/architect-profile.jpg',
    isVerified: true,
    isFeatured: true,
    completedProjects: 124,
    reviewCount: 48,
    trustScore: 0.92,
    designStyles: ['Contemporary Indian', 'Courtyard', 'Eco-conscious'],
    projectTypes: ['Villa', 'Apartment', 'Renovation'],
    citiesServed: ['Bengaluru', 'Mumbai', 'Hyderabad'],
    servicesOffered: ['Concept design', 'Project coordination', 'Interior integration'],
    projects: [
      {
        id: 'proj1',
        title: 'Modern Eco Home',
        image: '/images/project1.jpg',
        location: 'Whitefield, Bengaluru',
        year: '2022',
        area: '2500 sq ft',
      },
    ],
    templates: [
      {
        id: 'tpl1',
        name: 'Eco Starter Home',
        description: 'A compact, energy-efficient starter home for urban Indian plots.',
        price: 1200000,
      },
    ],
    experience: '10 years',
    teamSize: 5,
    moderationStatus: 'approved',
    isVerified: true,
    createdBy: demoArchitect._id,
  });

  // Create demo project
  const project = await ProjectModel.create({
    owner: demoHomeowner._id,
    architect: architectProfile._id,
    title: 'Dream Home Renovation',
    description: 'Full renovation of a brownstone in Brooklyn.',
    status: 'active',
    startDate: new Date('2023-01-01'),
    createdAt: new Date('2023-01-01'),
  });

  // Create demo notifications
  await NotificationModel.create([
    {
      user: demoHomeowner._id,
      type: 'system',
      title: 'Welcome to DomeLink!',
      body: 'Your account is ready. Start exploring architects now.',
      read: false,
      createdAt: new Date(),
    },
    {
      user: demoArchitect._id,
      type: 'project',
      title: 'New Project Inquiry',
      body: 'You have a new project inquiry from Demo Homeowner.',
      read: false,
      createdAt: new Date(),
    },
  ]);

  // Create demo review
  await ReviewModel.create({
    project: project._id,
    reviewer: demoHomeowner._id,
    reviewee: demoArchitect._id,
    rating: 5,
    comment: 'Amazing work! Highly recommended.',
    createdAt: new Date(),
  });

  // Create demo payment
  await PaymentModel.create({
    project: project._id,
    payer: demoHomeowner._id,
    payee: demoArchitect._id,
    amount: 5000,
    status: 'completed',
    method: 'card',
    createdAt: new Date(),
  });

  // Create demo support ticket
  await SupportTicketModel.create({
    user: demoHomeowner._id,
    subject: 'How do I contact my architect?',
    message: 'I want to discuss my project details.',
    status: 'open',
    createdAt: new Date(),
  });

  // Create demo consultation
  const consultation = await ConsultationModel.create({
    userId: demoHomeowner._id,
    architectId: architectProfile._id,
    message: 'I would like to schedule a consultation.',
    preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    projectType: 'Renovation',
    budget: 10000000,
    plotSize: '3000 sq ft',
    preferredStyle: 'modern',
    location: 'Bengaluru, Karnataka',
    status: 'pending',
    amount: 49,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create demo chat message
  await ChatMessageModel.create({
    consultationId: consultation._id,
    senderId: demoHomeowner._id,
    message: 'Hello, I am excited to work with you!',
    timestamp: new Date(),
    readBy: [
      { userId: demoHomeowner._id, readAt: new Date() },
    ],
  });

  console.log('Demo data seeded!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
