import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import User from "../models/User";
// Import other models as needed (Project, Architect, Notification, etc.)

const router = Router();

// GET /api/users/me
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

// GET /api/homeowner/dashboard
router.get(
  "/homeowner/dashboard",
  authenticate,
  requireRole("homeowner"),
  async (req: AuthRequest, res: Response) => {
    try {
      // Replace with real models and aggregation
      const userId = req.user!._id;
      // Example: Fetch projects, saved architects, notifications, activity
      const projects: any[] = [];
      const savedArchitects: any[] = [];
      const notifications: any[] = [];
      const activity: any[] = [];
      res.json({ projects, savedArchitects, notifications, activity });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch homeowner dashboard" });
    }
  }
);

// GET /api/architect/dashboard
router.get(
  "/architect/dashboard",
  authenticate,
  requireRole("architect"),
  async (req: AuthRequest, res: Response) => {
    try {
      // Replace with real models and aggregation
      const userId = req.user!._id;
      // Example: Fetch portfolio, client requests, proposals, analytics, reviews
      const portfolio: any[] = [];
      const clientRequests: any[] = [];
      const proposals: any[] = [];
      const analytics: any = {};
      const reviews: any[] = [];
      res.json({ portfolio, clientRequests, proposals, analytics, reviews });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch architect dashboard" });
    }
  }
);

export default router;
