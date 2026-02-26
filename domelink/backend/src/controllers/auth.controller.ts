import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { z } from "zod";
import { UserModel } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signJwt } from "../utils/jwt.js";
import { sanitizeUser } from "../utils/response.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["homeowner", "architect", "admin"]).default("homeowner"),
  avatar: z.string().url().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const payload = registerSchema.parse(req.body);

  const exists = await UserModel.findOne({ email: payload.email });
  if (exists) {
    throw new AppError("User already exists", 409);
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await UserModel.create({
    ...payload,
    passwordHash,
  });

  const token = signJwt({
    sub: String(user._id),
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });

  res.status(201).json({ token, user: sanitizeUser(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const payload = loginSchema.parse(req.body);

  const user = await UserModel.findOne({ email: payload.email }).select("+passwordHash");
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await bcrypt.compare(payload.password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = signJwt({
    sub: String(user._id),
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });

  res.status(200).json({ token, user: sanitizeUser(user) });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) {
    throw new AppError("Unauthorized", 401);
  }

  const user = await UserModel.findById(req.auth.sub);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({ user: sanitizeUser(user) });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) {
    throw new AppError("Unauthorized", 401);
  }

  await UserModel.findByIdAndUpdate(req.auth.sub, { $inc: { tokenVersion: 1 } });
  res.status(200).json({ ok: true });
});
