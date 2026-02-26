import { Schema, model } from "mongoose";

export interface PaymentDocument {
  project: Schema.Types.ObjectId;
  payer: Schema.Types.ObjectId;
  payee: Schema.Types.ObjectId;
  amount: number;
  status: "pending" | "completed" | "failed";
  method: "card" | "bank" | "cash";
  createdAt: Date;
}

const paymentSchema = new Schema<PaymentDocument>({
  project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  payer: { type: Schema.Types.ObjectId, ref: "User", required: true },
  payee: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  method: { type: String, enum: ["card", "bank", "cash"], required: true },
  createdAt: { type: Date, default: Date.now },
});

export const PaymentModel = model<PaymentDocument>("Payment", paymentSchema);
