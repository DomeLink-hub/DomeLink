import { Router } from "express";
import {
	acceptTeamInvite,
	addTeamMember,
	getPendingInvites,
	getTeamMembers,
	inviteTeamMember,
	removeTeamMember,
} from "../controllers/team.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const teamRouter = Router();

teamRouter.get("/:architectId", requireAuth, requireRole(["architect", "admin"]), getTeamMembers);
teamRouter.get("/:architectId/invites", requireAuth, requireRole(["architect", "admin"]), getPendingInvites);
teamRouter.post("/invite", requireAuth, requireRole(["architect", "admin"]), inviteTeamMember);
teamRouter.post("/invite/:token/accept", requireAuth, acceptTeamInvite);
teamRouter.post("/", requireAuth, requireRole(["architect", "admin"]), addTeamMember);
teamRouter.delete("/:memberId", requireAuth, requireRole(["architect", "admin"]), removeTeamMember);
