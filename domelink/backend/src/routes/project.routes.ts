import { Router } from "express";
import { createProject, getMyProjects, getProjectDetails, createMilestone, updateMilestone } from "../controllers/project.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, createProject);
router.get("/my", authenticate, getMyProjects);
router.get("/:id", authenticate, getProjectDetails);
router.post("/:projectId/milestone", authenticate, createMilestone);
router.put("/milestone/:milestoneId/status", authenticate, updateMilestone);

export default router;
