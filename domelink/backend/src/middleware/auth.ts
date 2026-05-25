import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      city: user.city ?? undefined,
      projectType: user.projectType ?? undefined,
      plotSize: user.plotSize ?? undefined,
      budgetMin: user.budgetMin ?? undefined,
      budgetMax: user.budgetMax ?? undefined,
      preferredStyles: user.preferredStyles ?? undefined,
      vastuPreference: user.vastuPreference ?? undefined,
      timeline: user.timeline ?? undefined,
      familySize: user.familySize ?? undefined,
      projectStage: user.projectStage ?? undefined,
      onboardingCompleted: user.onboardingCompleted ?? undefined,
    };
    // compatibility: some legacy controllers expect req.auth.sub/email
    try {
      (req as any).auth = { sub: user.id, email: user.email };
    } catch (e) {
      // ignore
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const requireAuth = authenticate;

export const requireRole = (allowedRoles: Array<string>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = String(req.user?.role || "").toLowerCase();
    const normalizedAllowed = allowedRoles.map((role) => role.toLowerCase());

    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, no user" });
    }

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};