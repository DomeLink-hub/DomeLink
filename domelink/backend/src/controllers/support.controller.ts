import type { Request, Response } from "express";
import { SupportTicketModel } from "../models/SupportTicket.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getSupportTicketsForArchitect = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.params.architectId;
  const tickets = await SupportTicketModel.find({ architect: architectId });
  res.status(200).json(tickets);
});

export const createSupportTicket = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.params.architectId;
  const { subject, message, status } = req.body;
  if (!req.auth?.sub) throw new AppError("Unauthorized", 401);
  const ticket = await SupportTicketModel.create({
    architect: architectId,
    user: req.auth.sub,
    subject,
    message,
    status: status || "open",
    createdAt: new Date(),
  });
  res.status(201).json(ticket);
});
