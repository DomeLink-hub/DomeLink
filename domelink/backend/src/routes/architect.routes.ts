import { Router } from "express";
import { getArchitects, getArchitectBySlug } from "../controllers/architect.controller.js";

const router = Router();
router.get("/", getArchitects);
router.get("/:slug", getArchitectBySlug);

export default router;