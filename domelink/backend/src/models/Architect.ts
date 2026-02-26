import { Schema, model } from "mongoose";

interface ArchitectProject {
  id: string;
  title: string;
  image: string;
  location: string;
  year: string;
  area?: string;
}

interface ArchitectTemplate {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface ArchitectDocument {
  _id: Schema.Types.ObjectId;
  slug: string;
  name: string;
  location: string;
  locationGeo?: {
    lat: number;
    lng: number;
  };
  styleTags: string[];
  specialty: string;
  rating: number;
  startingPrice: number;
  about: string;
  heroImage: string;
  profileImage: string;
  projects: ArchitectProject[];
  templates: ArchitectTemplate[];
  experience: string;
  teamSize: number;
  createdBy?: Schema.Types.ObjectId;
  moderationStatus: "pending" | "approved" | "rejected";
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<ArchitectProject>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    location: { type: String, required: true },
    year: { type: String, required: true },
    area: { type: String },
  },
  { _id: false },
);

const templateSchema = new Schema<ArchitectTemplate>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false },
);

const architectSchema = new Schema<ArchitectDocument>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    locationGeo: {
      lat: { type: Number },
      lng: { type: Number },
    },
    styleTags: { type: [String], default: [] },
    specialty: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    startingPrice: { type: Number, required: true },
    about: { type: String, required: true },
    heroImage: { type: String, required: true },
    profileImage: { type: String, required: true },
    projects: { type: [projectSchema], default: [] },
    templates: { type: [templateSchema], default: [] },
    experience: { type: String, required: true },
    teamSize: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    moderationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    isVerified: { type: Boolean, default: false, required: true },
  },
  { timestamps: true },
);

architectSchema.index({ location: 1 });
architectSchema.index({ rating: -1, startingPrice: 1 });
architectSchema.index({ specialty: 1, styleTags: 1 });

export const ArchitectModel = model<ArchitectDocument>("Architect", architectSchema);
