import { Schema, model } from "mongoose";


export interface SupportTicketDocument {
  user: Schema.Types.ObjectId;
  architect: Schema.Types.ObjectId;
  subject: string;
  message: string;
  status: "open" | "closed" | "pending";
  createdAt: Date;
}


const supportTicketSchema = new Schema<SupportTicketDocument>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  architect: { type: Schema.Types.ObjectId, ref: "Architect", required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["open", "closed", "pending"], default: "open" },
  createdAt: { type: Date, default: Date.now },
});

export const SupportTicketModel = model<SupportTicketDocument>("SupportTicket", supportTicketSchema);
