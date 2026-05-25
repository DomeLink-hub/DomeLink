import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";
import { auditService } from "../services/audit.service.js";
import { analyticsService } from "../services/analytics.service.js";

const prisma = new PrismaClient();

const userProfileSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  city: true,
  projectType: true,
  plotSize: true,
  budgetMin: true,
  budgetMax: true,
  preferredStyles: true,
  vastuPreference: true,
  timeline: true,
  familySize: true,
  projectStage: true,
  onboardingCompleted: true,
} as const;

const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE || "7d";
const REFRESH_TOKEN_EXPIRE_DAYS = Number(process.env.REFRESH_TOKEN_DAYS || "30");

const generateToken = (id: string) => {
  return (jwt as any).sign({ id }, process.env.JWT_SECRET as string, { expiresIn: ACCESS_TOKEN_EXPIRE });
};

const generateRefreshTokenValue = () => crypto.randomBytes(48).toString("hex");

const setRefreshCookie = (res: Response, tokenValue: string) => {
  const maxAge = REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000;
  res.cookie("refresh_token", tokenValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/api/auth",
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role ? role.toUpperCase() : "CLIENT",
      },
    });

    const token = generateToken(user.id);
    // create refresh token record
    const refreshValue = generateRefreshTokenValue();
    await prisma.refreshToken.create({ data: { token: refreshValue, userId: user.id, expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000) } });
    setRefreshCookie(res, refreshValue);
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: userProfileSelect,
    });
    
    await auditService.log({ actorId: user.id, action: "register", metadata: { email: user.email, role: user.role } });
    await analyticsService.track({ userId: user.id, eventName: "user_registered" });
    
    return res.status(201).json({
      token,
      user: profile,
    });
  } catch (e) {
    console.error("REGISTER ERROR:", e);
    return res.status(500).json({ message: "Server error during registration" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user.id);    const refreshValue = generateRefreshTokenValue();
    await prisma.refreshToken.create({ data: { token: refreshValue, userId: user.id, expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000) } });
    setRefreshCookie(res, refreshValue);
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: userProfileSelect,
    });
    await auditService.log({ actorId: user.id, action: "login", metadata: { email: user.email, role: user.role } });
    await analyticsService.track({ userId: user.id, eventName: "user_login" });
    return res.status(200).json({
      token,
      user: profile,
    });
  } catch (e) {
    console.error("LOGIN ERROR:", e);
    return res.status(500).json({ message: "Server error during login" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userProfileSelect,
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user, consultationCount: 0, earnings: 0 });
  } catch (e) {
    console.error("GET ME ERROR:", e);
    return res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refresh = req.cookies?.refresh_token as string | undefined;
    if (refresh) {
      await prisma.refreshToken.updateMany({ where: { token: refresh }, data: { revoked: true } });
      res.clearCookie("refresh_token", { path: "/api/auth" });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("LOGOUT ERROR:", e);
    return res.status(500).json({ ok: false });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refresh = req.cookies?.refresh_token as string | undefined;
    if (!refresh) return res.status(401).json({ message: "No refresh token" });

    const record = await prisma.refreshToken.findUnique({ where: { token: refresh } });
    if (!record || record.revoked || (record.expiresAt && record.expiresAt < new Date())) {
      return res.status(401).json({ message: "Refresh token invalid" });
    }

    const user = await prisma.user.findUnique({ where: { id: record.userId } });
    if (!user) return res.status(401).json({ message: "User not found" });

    const newAccess = generateToken(user.id);
    // optionally rotate refresh token
    const newRefreshValue = generateRefreshTokenValue();
    await prisma.refreshToken.updateMany({ where: { token: refresh }, data: { revoked: true } });
    await prisma.refreshToken.create({ data: { token: newRefreshValue, userId: user.id, expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000) } });
    setRefreshCookie(res, newRefreshValue);

    return res.status(200).json({ token: newAccess, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    console.error("REFRESH ERROR:", e);
    return res.status(500).json({ message: "Error refreshing token" });
  }
};