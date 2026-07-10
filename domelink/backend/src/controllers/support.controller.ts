import type { Request, Response } from "express";
import { SupportTicketModel } from "../models/SupportTicket.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../utils/logger.js";

export const getSupportTicketsForArchitect = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.params.architectId;

  try {
    const tickets = await SupportTicketModel.find({ architect: architectId });
    res.status(200).json(tickets);
  } catch (err: any) {
    logger.warn("MongoDB error in getSupportTicketsForArchitect", { error: err.message, architectId });
    res.status(503).json({ error: "Support service temporarily unavailable" });
  }
});

export const createSupportTicket = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.params.architectId;
  const { subject, message, status } = req.body;
  if (!req.auth?.sub) throw new AppError("Unauthorized", 401);

  try {
    const ticket = await SupportTicketModel.create({
      architect: architectId,
      user: req.auth.sub,
      subject,
      message,
      status: status || "open",
      createdAt: new Date(),
    });
    res.status(201).json(ticket);
  } catch (err: any) {
    logger.warn("MongoDB error in createSupportTicket", { error: err.message, architectId });
    res.status(503).json({ error: "Support service temporarily unavailable" });
  }
});
