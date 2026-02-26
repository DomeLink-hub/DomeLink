import { UserModel } from "../models/User.js";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyJwt } from "../utils/jwt.js";

// Extend Express Request type to allow auth property
declare module "express-serve-static-core" {
  interface Request {
    auth?: any;
  }
}

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"] as string | undefined;
  if (!authHeader?.startsWith("Bearer ")) {
    console.log("[AUTH] Missing or malformed Authorization header", req.headers);
    return next(new AppError("Unauthorized", 401));
  }

  const token = authHeader.replace("Bearer ", "").trim();
  try {
    const decoded = verifyJwt(token);
    UserModel.findById(decoded.sub).select("tokenVersion role email status").then(user => {
      if (!user || user.tokenVersion !== decoded.tokenVersion) {
        console.log("[AUTH] Invalid tokenVersion or user not found", decoded);
        return next(new AppError("Invalid token", 401));
      }
      if (user.status === "suspended") {
        console.log("[AUTH] Suspended user", user.email);
        return next(new AppError("Account suspended", 403));
      }
      req.auth = decoded;
      console.log(`[AUTH] Authenticated user: ${user.email}, role: ${user.role}`);
      next();
    }).catch(err => {
      console.log("[AUTH] JWT verification failed", err);
      return next(new AppError("Invalid token", 401));
    });
  } catch (err) {
    console.log("[AUTH] JWT verification failed", err);
    return next(new AppError("Invalid token", 401));
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      console.log(`[ROLE] Forbidden: user role ${req.auth?.role}, required: ${roles}`);
      return next(new AppError("Forbidden", 403));
    }
    console.log(`[ROLE] Role check passed: ${req.auth.role}`);
    next();
  };
};
