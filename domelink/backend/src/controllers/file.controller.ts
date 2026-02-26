import type { Request, Response } from "express";
import { FileModel } from "../models/File.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getFilesForArchitect = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.params.architectId;
  const files = await FileModel.find({ uploader: architectId });
  res.status(200).json(files);
});

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.params.architectId;
  const { filename, url, type, size, project } = req.body;
  if (!req.auth?.sub) throw new AppError("Unauthorized", 401);
  const file = await FileModel.create({
    project,
    uploader: architectId,
    filename,
    url,
    type,
    size,
    createdAt: new Date(),
  });
  res.status(201).json(file);
});
