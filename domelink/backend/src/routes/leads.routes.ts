import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { expressInterestInLead, getClientLeads } from "../controllers/leads.controller.js";

const leadsRouter = Router();

leadsRouter.get("/", requireAuth, requireRole(["ARCHITECT", "architect"]), getClientLeads);
leadsRouter.post("/:userId/interest", requireAuth, requireRole(["ARCHITECT", "architect"]), expressInterestInLead);

export default leadsRouter;
