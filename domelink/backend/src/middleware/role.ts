import type { Request, Response, NextFunction } from "express";

type RoleName = "CLIENT" | "ARCHITECT" | "ADMIN" | "SUPERADMIN" | "homeowner" | "architect" | "admin" | "superadmin";

const roleMap: Record<string, "CLIENT" | "ARCHITECT" | "ADMIN" | "SUPERADMIN"> = {
  homeowner: "CLIENT",
  architect: "ARCHITECT",
  admin: "ADMIN",
  superadmin: "SUPERADMIN",
};

export function requireRole(role: RoleName) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(403).json({ message: "Forbidden: No user" });
    }

    const expectedRole = roleMap[role] ?? role;
    if (user.role !== expectedRole) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }

    next();
  };
}