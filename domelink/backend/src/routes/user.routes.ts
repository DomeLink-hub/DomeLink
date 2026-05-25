import { Router } from "express";
import {
  getMe,
  getSavedArchitects,
  saveArchitect,
  unsaveArchitect,
  updateMe,
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.js";

export const userRouter = Router();

userRouter.get("/me", authenticate, getMe);
userRouter.patch("/me", authenticate, updateMe);
userRouter.get("/saved", authenticate, getSavedArchitects);
userRouter.post("/saved/:architectId", authenticate, saveArchitect);
userRouter.delete("/saved/:architectId", authenticate, unsaveArchitect);
