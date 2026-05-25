import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma.js";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // MATCHES jwt.ts: Extracts { id: string } instead of the old { sub: string }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    // Fetch user from Postgres using the id
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
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
        onboardingCompleted: true
      } // Exclude password hash
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Middleware Auth Error:", error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};