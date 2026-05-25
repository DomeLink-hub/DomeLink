import mongoose, { Document, Schema } from "mongoose";

export interface SupportTicketDocument extends Document {
  user: string;
  architect?: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
}

const SupportTicketSchema = new Schema<SupportTicketDocument>(
  {
    user: { type: String, ref: "User", required: true, index: true },
    architect: { type: String, ref: "User" },
    subject: { type: String, default: "" },
    message: { type: String, default: "" },
    status: { type: String, default: "open" },
  },
  { timestamps: true },
);

export const SupportTicketModel = mongoose.models.SupportTicket || mongoose.model<SupportTicketDocument>("SupportTicket", SupportTicketSchema);

export default SupportTicketModel;
