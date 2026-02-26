import type { Request, Response } from "express";
import { PaymentModel } from "../models/Payment.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getPaymentsForArchitect = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.params.architectId;
  const payments = await PaymentModel.find({ payee: architectId });
  res.status(200).json(payments);
});

export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.params.architectId;
  const { amount, status, method, project } = req.body;
  if (!req.auth?.sub) throw new AppError("Unauthorized", 401);
  const payment = await PaymentModel.create({
    project,
    payer: req.auth.sub,
    payee: architectId,
    amount,
    status,
    method,
    createdAt: new Date(),
  });
  res.status(201).json(payment);
});
