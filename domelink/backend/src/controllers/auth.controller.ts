import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";
import { auditService } from "../services/audit.service.js";
import { analyticsService } from "../services/analytics.service.js";
import { generateSecureToken, hashToken } from "../utils/tokens.js";
import { emailEvents } from "../services/email/email.service.js";
import { createAndEmitNotification } from "../services/notification.service.js";

const prisma = new PrismaClient();

const userProfileSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  firmName: true,
  coaRegistrationNumber: true,
  gstNumber: true,
  yearsOfExperience: true,
  state: true,
  city: true,
  location: true,
  specialty: true,
  startingPrice: true,
  experience: true,
  teamSize: true,
  heroImage: true,
  profileImage: true,
  profilePhoto: true,
  about: true,
  slug: true,
  isVerified: true,
  isFeatured: true,
  consultationFee: true,
  startingProjectBudget: true,
  maximumProjectBudget: true,
  rating: true,
  completedProjects: true,
  reviewCount: true,
  trustScore: true,
  onlineConsultation: true,
  offlineConsultation: true,
  siteVisitAvailable: true,
  expertise: true,
  designStyles: true,
  workingStyles: true,
  projectTypes: true,
  citiesServed: true,
  serviceCities: true,
  servicesOffered: true,
  portfolioImages: true,
  awards: true,
  certifications: true,
  profileCompletionPercentage: true,
  onboardingCompleted: true,
  projectType: true,
  plotSize: true,
  budgetMin: true,
  budgetMax: true,
  preferredStyles: true,
  vastuPreference: true,
  timeline: true,
  familySize: true,
  projectStage: true,
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

    // --- Email verification token (additive, non-blocking) ---
    try {
      const rawVerifyToken = generateSecureToken();
      const hashedVerifyToken = hashToken(rawVerifyToken);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: hashedVerifyToken,
          emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });
      await emailEvents.verifyEmail(user.email, rawVerifyToken);
    } catch (emailErr) {
      // Log and continue — email failure must not block successful registration
      logger.warn("Failed to send verification email after registration", { userId: user.id, error: String(emailErr) });
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: userProfileSelect,
    });
    
    await auditService.log({ actorId: user.id, action: "register", metadata: { email: user.email, role: user.role } });
    await analyticsService.track({ userId: user.id, eventName: "user_registered" });
    
    // Architect Onboarding Broadcast Event
    if (user.role === "ARCHITECT") {
      prisma.user
        .findMany({ where: { role: "CLIENT" }, select: { id: true } })
        .then(async (homeowners) => {
          for (const homeowner of homeowners) {
            await createAndEmitNotification({
              userId: homeowner.id,
              type: "system",
              title: "New Architect Joined",
              message: `${user.name} has joined DomeLink as an architect!`,
              metadata: { architectId: user.id },
            });
          }
        })
        .catch((err) => logger.error("Failed to broadcast architect registration", { error: String(err) }));
    }

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

// ─────────────────────────────────────────────────────────────
// EMAIL VERIFICATION
// ─────────────────────────────────────────────────────────────

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const hashed = hashToken(token);
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: hashed,
        emailVerificationExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Verification link is invalid or has expired" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (e) {
    console.error("VERIFY EMAIL ERROR:", e);
    return res.status(500).json({ message: "Server error during email verification" });
  }
};

export const resendVerification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Idempotent — if already verified, treat as success
    if (user.emailVerified) {
      return res.status(200).json({ message: "Email is already verified" });
    }

    const rawToken = generateSecureToken();
    const hashedToken = hashToken(rawToken);

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Non-blocking — same pattern as registration
    try {
      await emailEvents.verifyEmail(user.email, rawToken);
    } catch (emailErr) {
      logger.warn("Failed to resend verification email", { userId, error: String(emailErr) });
    }

    return res.status(200).json({ message: "Verification email sent" });
  } catch (e) {
    console.error("RESEND VERIFICATION ERROR:", e);
    return res.status(500).json({ message: "Server error resending verification email" });
  }
};

// ─────────────────────────────────────────────────────────────
// PASSWORD RESET
// ─────────────────────────────────────────────────────────────

export const forgotPassword = async (req: Request, res: Response) => {
  // Always return the same message — never reveal whether email is registered
  const safeResponse = { message: "If an account exists with this email, a reset link has been sent" };

  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(200).json(safeResponse);
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    // If no user — return safe response without doing anything
    if (!user) {
      return res.status(200).json(safeResponse);
    }

    const rawToken = generateSecureToken();
    const hashedToken = hashToken(rawToken);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Non-blocking
    try {
      await emailEvents.resetPassword(user.email, rawToken);
    } catch (emailErr) {
      logger.warn("Failed to send password reset email", { userId: user.id, error: String(emailErr) });
    }

    return res.status(200).json(safeResponse);
  } catch (e) {
    console.error("FORGOT PASSWORD ERROR:", e);
    // Still return safe response — don't leak information via error divergence
    return res.status(200).json(safeResponse);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Reset token is required" });
    }
    if (!newPassword || typeof newPassword !== "string") {
      return res.status(400).json({ message: "New password is required" });
    }

    const hashed = hashToken(token);
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashed,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset link is invalid or has expired" });
    }

    // Hash the new password — same salt rounds (10) as the register function
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password, clear reset token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Revoke all existing refresh tokens for this user —
    // same mechanism as logout: updateMany with revoked: true
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revoked: false },
      data: { revoked: true },
    });

    await auditService.log({ actorId: user.id, action: "password_reset", metadata: { email: user.email } });

    return res.status(200).json({ message: "Password reset successfully. Please log in with your new password." });
  } catch (e) {
    console.error("RESET PASSWORD ERROR:", e);
    return res.status(500).json({ message: "Server error during password reset" });
  }
};
