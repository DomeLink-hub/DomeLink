import { Router } from "express";
import { getFilesForArchitect, uploadFile } from "../controllers/file.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const fileRouter = Router();

fileRouter.get("/architect/:architectId", requireAuth, getFilesForArchitect);
fileRouter.post("/architect/:architectId", requireAuth, requireRole(["architect", "admin"]), uploadFile);
