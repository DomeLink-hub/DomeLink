import type { Request, Response } from "express";
import { FileModel } from "../models/File.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

export const uploadSharedFile = asyncHandler(async (req: Request, res: Response) => {
  const { consultationId, projectId, name, url, type } = req.body;
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const sharedFile = await prisma.sharedFile.create({
    data: {
      consultationId: consultationId || null,
      projectId: projectId || null,
      uploadedById: userId,
      name,
      url,
      type
    }
  });
  res.status(201).json(sharedFile);
});

export const getSharedFiles = asyncHandler(async (req: Request, res: Response) => {
  const { consultationId, projectId } = req.query;
  const files = await prisma.sharedFile.findMany({
    where: {
      ...(consultationId ? { consultationId: String(consultationId) } : {}),
      ...(projectId ? { projectId: String(projectId) } : {})
    },
    orderBy: { createdAt: "desc" }
  });
  res.status(200).json(files);
});
