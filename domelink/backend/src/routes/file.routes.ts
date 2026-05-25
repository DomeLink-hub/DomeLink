import { Router } from "express";
import { getFilesForArchitect, uploadFile, uploadSharedFile, getSharedFiles } from "../controllers/file.controller.js";
import { requireAuth, requireRole, authenticate } from "../middleware/auth.js";

import { FileModel } from "../models/File.js";

export const fileRouter = Router();
// Get files for current user
fileRouter.get("/my", requireAuth, async (req, res) => {
	const userId = req.auth?.sub;
	if (!userId) return res.status(401).json({ error: "Unauthorized" });
	const files = await FileModel.find({ uploader: userId });
	res.status(200).json(files);
});

fileRouter.get("/architect/:architectId", requireAuth, getFilesForArchitect);
fileRouter.post("/architect/:architectId", requireAuth, requireRole(["architect", "admin"]), uploadFile);

// New SharedFile routes
fileRouter.post("/shared", authenticate, uploadSharedFile);
fileRouter.get("/shared", authenticate, getSharedFiles);

export default fileRouter;
