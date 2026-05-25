import mongoose, { Document, Schema, Types } from "mongoose";

export interface ArchitectDocument extends Document {
  name: string;
  slug: string;
  location: string;
  specialty: string;
  styleTags: string[];
  projectTypes?: string[];
  citiesServed?: string[];
  startingPrice: number;
  rating: number;
  about?: string;
  heroImage?: string;
  profileImage?: string;
  projects?: Array<Record<string, unknown>>;
  templates?: Array<Record<string, unknown>>;
  experience?: string;
  teamSize?: number;
  moderationStatus?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  consultationFee?: number;
  completedProjects?: number;
  reviewCount?: number;
  trustScore?: number;
  servicesOffered?: string[];
  designStyles?: string[];
  createdBy?: Types.ObjectId;
}

const ProjectSchema = new Schema(
  {
    id: String,
    title: String,
    image: String,
    images: [String],
    location: String,
    year: String,
    area: String,
    description: String,
    style: String,
    projectType: String,
    clientName: String,
    featured: { type: Boolean, default: false },
  },
  { _id: false },
);

const TemplateSchema = new Schema(
  {
    id: String,
    name: String,
    description: String,
    price: Number,
  },
  { _id: false },
);

const ArchitectSchema = new Schema<ArchitectDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    location: { type: String, default: "" },
    specialty: { type: String, default: "" },
    styleTags: { type: [String], default: [] },
    projectTypes: { type: [String], default: [] },
    citiesServed: { type: [String], default: [] },
    startingPrice: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    about: { type: String, default: "" },
    heroImage: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    projects: { type: [ProjectSchema], default: [] },
    templates: { type: [TemplateSchema], default: [] },
    experience: { type: String, default: "" },
    teamSize: { type: Number, default: 1 },
    moderationStatus: { type: String, default: "pending" },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    consultationFee: { type: Number, default: 0 },
    completedProjects: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    trustScore: { type: Number, default: 0 },
    servicesOffered: { type: [String], default: [] },
    designStyles: { type: [String], default: [] },
    createdBy: { type: String, ref: "User" },
  },
  { timestamps: true },
);

export const ArchitectModel = mongoose.models.Architect || mongoose.model<ArchitectDocument>("Architect", ArchitectSchema);
