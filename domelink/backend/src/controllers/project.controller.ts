import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";

const prisma = new PrismaClient();

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const { consultationId, title, description, estimatedBudget, estimatedTime } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const consultation = await prisma.consultation.findUnique({ where: { id: consultationId } });
  if (!consultation || consultation.architectId !== userId) {
    return res.status(403).json({ message: "Only assigned architect can create a project." });
  }

  const project = await prisma.project.create({
    data: {
      consultationId,
      architectId: consultation.architectId,
      homeownerId: consultation.userId,
      title,
      // description is optional from the client; default to empty string to satisfy
      // the non-nullable Prisma field — avoids a DB error when not provided.
      description: description ?? "",
      estimatedBudget: estimatedBudget ? parseInt(estimatedBudget, 10) : null,
      estimatedTime,
      status: "planning"
    }
  });

  await prisma.consultation.update({
    where: { id: consultationId },
    data: { status: "IN_PROGRESS" }
  });

  res.status(201).json(project);
});

export const getMyProjects = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const projects = await prisma.project.findMany({
    where: {
      OR: [{ homeownerId: userId }, { architectId: userId }]
    },
    include: {
      consultation: {
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          architect: { select: { id: true, name: true, avatar: true, slug: true } }
        }
      },
      milestones: true
    },
    orderBy: { createdAt: "desc" }
  });

  res.status(200).json(projects);
});

export const getProjectDetails = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      milestones: { orderBy: { createdAt: "asc" } },
      consultation: {
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          architect: { select: { id: true, name: true, avatar: true, slug: true } }
        }
      }
    }
  });

  if (!project) return res.status(404).json({ message: "Project not found" });
  if (project.homeownerId !== userId && project.architectId !== userId) return res.status(403).json({ message: "Forbidden" });

  res.status(200).json(project);
});

export const createMilestone = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { title, description, dueDate } = req.body;
  const userId = req.user?.id;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.architectId !== userId) {
    return res.status(403).json({ message: "Forbidden. Only architect can create milestones." });
  }

  const milestone = await prisma.projectMilestone.create({
    data: {
      projectId,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null
    }
  });

  res.status(201).json(milestone);
});

export const updateMilestone = asyncHandler(async (req: Request, res: Response) => {
  const { milestoneId } = req.params;
  const { status } = req.body;
  const userId = req.user?.id;

  const milestone = await prisma.projectMilestone.findUnique({
    where: { id: milestoneId },
    include: { project: true }
  });

  if (!milestone) return res.status(404).json({ message: "Milestone not found" });

  const project = milestone.project;
  if (project.homeownerId !== userId && project.architectId !== userId) {
     return res.status(403).json({ message: "Forbidden" });
  }

  const updatedRef = await prisma.projectMilestone.update({
    where: { id: milestoneId },
    data: { status }
  });

  res.status(200).json(updatedRef);
});
