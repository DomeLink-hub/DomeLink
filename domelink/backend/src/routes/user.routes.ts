import { Router } from "express";
import {
  getProfile,
  getSavedArchitects,
  saveArchitect,
  unsaveArchitect,
  updateProfile,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const userRouter = Router();

userRouter.get("/me", requireAuth, getProfile);
userRouter.patch("/me", requireAuth, updateProfile);
userRouter.get("/saved", requireAuth, getSavedArchitects);
userRouter.post("/saved/:architectId", requireAuth, saveArchitect);
userRouter.delete("/saved/:architectId", requireAuth, unsaveArchitect);
