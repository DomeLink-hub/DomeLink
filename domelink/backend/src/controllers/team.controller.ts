import type { Request, Response } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { TeamMemberModel } from "../models/TeamMember.js";
import { TeamInviteModel } from "../models/TeamInvite.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTeamSchema = z.object({
  architectId: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  role: z.string().min(2),
  avatar: z.string().url().optional(),
  status: z.enum(["online", "offline", "away"]).default("offline"),
});

const inviteSchema = z.object({
  architectId: z.string(),
  email: z.string().email(),
  role: z.string().min(2),
});

export const getTeamMembers = asyncHandler(async (req: Request, res: Response) => {
  const members = await TeamMemberModel.find({ architectId: req.params.architectId }).sort({ createdAt: -1 });
  res.status(200).json(members);
});

export const getPendingInvites = asyncHandler(async (req: Request, res: Response) => {
  const invites = await TeamInviteModel.find({
    architectId: req.params.architectId,
    status: "pending",
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  res.status(200).json(invites);
});

export const addTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const payload = createTeamSchema.parse(req.body);
  const member = await TeamMemberModel.create(payload);
  res.status(201).json(member);
});

export const inviteTeamMember = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) throw new AppError("Unauthorized", 401);
  const payload = inviteSchema.parse(req.body);

  const existingMember = await TeamMemberModel.findOne({
    architectId: payload.architectId,
    email: payload.email.toLowerCase(),
  });
  if (existingMember) {
    throw new AppError("This email is already a team member", 409);
  }

  const existingInvite = await TeamInviteModel.findOne({
    architectId: payload.architectId,
    email: payload.email.toLowerCase(),
    status: "pending",
    expiresAt: { $gt: new Date() },
  });
  if (existingInvite) {
    throw new AppError("An active invitation already exists for this email", 409);
  }

  const invite = await TeamInviteModel.create({
    architectId: payload.architectId,
    email: payload.email.toLowerCase(),
    role: payload.role,
    token: crypto.randomUUID(),
    invitedBy: req.auth.sub,
    status: "pending",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  });

  res.status(201).json(invite);
});

export const acceptTeamInvite = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub || !req.auth.email) throw new AppError("Unauthorized", 401);

  const invite = await TeamInviteModel.findOne({ token: req.params.token, status: "pending" });
  if (!invite) throw new AppError("Invite not found", 404);
  if (invite.expiresAt.getTime() < Date.now()) {
    invite.status = "expired";
    await invite.save();
    throw new AppError("Invite has expired", 410);
  }
  if (invite.email !== req.auth.email.toLowerCase()) {
    throw new AppError("This invite is not for your account", 403);
  }

  const existingMember = await TeamMemberModel.findOne({ architectId: invite.architectId, email: invite.email });
  if (!existingMember) {
    await TeamMemberModel.create({
      architectId: invite.architectId,
      name: req.auth.email.split("@")[0],
      email: invite.email,
      role: invite.role,
      status: "offline",
    });
  }

  invite.status = "accepted";
  await invite.save();

  res.status(200).json({ ok: true });
});

export const removeTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await TeamMemberModel.findByIdAndDelete(req.params.memberId);
  if (!member) throw new AppError("Team member not found", 404);
  res.status(204).send();
});
