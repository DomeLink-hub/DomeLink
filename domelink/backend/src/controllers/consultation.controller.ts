import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { createAndEmitNotification } from "../services/notification.service.js";

const ConsultationStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  IN_PROGRESS: "IN_PROGRESS",
  REVIEW_PENDING: "REVIEW_PENDING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

type ConsultationStatus = (typeof ConsultationStatus)[keyof typeof ConsultationStatus];

const prisma = new PrismaClient();

const consultationSelect = {
  id: true,
  status: true,
  userId: true,
  architectId: true,
  createdAt: true,
  updatedAt: true,
};

const mapStatusInput = (status: string): ConsultationStatus => {
  const upper = String(status || "").toUpperCase();
  if (upper === "PENDING") return ConsultationStatus.PENDING;
  if (upper === "ACCEPTED") return ConsultationStatus.ACCEPTED;
  if (upper === "IN_PROGRESS" || upper === "ACTIVE") return ConsultationStatus.IN_PROGRESS;
  if (upper === "REVIEW_PENDING") return ConsultationStatus.REVIEW_PENDING;
  if (upper === "COMPLETED") return ConsultationStatus.COMPLETED;
  if (upper === "CANCELLED" || upper === "CANCELED" || upper === "REJECTED" || upper === "CLOSED") return ConsultationStatus.CANCELLED;
  return ConsultationStatus.PENDING;
};

const ensureParticipant = (consultation: { userId: string; architectId: string }, userId: string) => {
  if (consultation.userId !== userId && consultation.architectId !== userId) {
    throw new AppError("Forbidden", 403);
  }
};

const ensureArchitect = (consultation: { architectId: string }, userId: string) => {
  if (consultation.architectId !== userId) {
    throw new AppError("Only architect can perform this action", 403);
  }
};

const transitionConsultation = async (
  consultationId: string,
  actorUserId: string,
  nextStatus: ConsultationStatus,
  options: {
    allowedFrom?: ConsultationStatus[];
    architectOnly?: boolean;
    notificationTitle: string;
    notificationMessage: (ctx: { actorIsArchitect: boolean }) => string;
    force?: boolean;
  },
) => {
  const consultation = await prisma.consultation.findUnique({ where: { id: consultationId }, select: consultationSelect });
  if (!consultation) throw new AppError("Consultation not found", 404);

  ensureParticipant(consultation, actorUserId);
  if (options.architectOnly) ensureArchitect(consultation, actorUserId);

  const currentStatus = mapStatusInput(consultation.status);

  if (!options.force && options.allowedFrom && !options.allowedFrom.includes(currentStatus)) {
    throw new AppError(
      `Invalid transition from ${currentStatus} to ${nextStatus}`,
      400,
    );
  }

  const updated = await prisma.consultation.update({
    where: { id: consultationId },
    data: { status: nextStatus },
  });

  const actorIsArchitect = consultation.architectId === actorUserId;
  const receiverId = actorIsArchitect ? consultation.userId : consultation.architectId;
  await createAndEmitNotification({
    userId: receiverId,
    type: "consultation_status",
    title: options.notificationTitle,
    message: options.notificationMessage({ actorIsArchitect }),
  });

  return updated;
};

export const getMyConsultations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId || !userRole) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Determine if we are querying for a homeowner or an architect
  const whereClause = userRole === "ARCHITECT" 
    ? { architectId: userId } 
    : { userId: userId };

  const consultations = await prisma.consultation.findMany({
    where: whereClause,
    include: {
      // Bring in the details of both parties so the UI can show names/avatars
      user: { select: { id: true, name: true, avatar: true } },
      architect: { select: { id: true, name: true, avatar: true } }, // Adjust to match your schema relation names
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json(consultations);
});

export const createConsultation = asyncHandler(async (req: Request, res: Response) => {
  const { 
    architectId, message, projectType, budget, timeline, plotDetails, notes, inspirationLinks, uploadedReferences 
  } = req.body;
  const userId = req.user?.id;

  if (!userId || !architectId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const consultation = await prisma.consultation.create({
    data: {
      userId,
      architectId,
      message,
      projectType,
      budget: budget ? parseInt(budget, 10) : null,
      timeline: timeline || null,
      plotDetails: plotDetails || null,
      notes: notes || null,
      inspirationLinks: inspirationLinks || [],
      uploadedReferences: uploadedReferences || [],
      status: ConsultationStatus.PENDING,
      amount: 0,
    },
  });

  await createAndEmitNotification({
    userId: architectId,
    type: "consultation_status",
    title: "New Consultation Request",
    message: "A homeowner started a free consultation with you.",
  });

  res.status(201).json(consultation);
});

export const acceptConsultation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const updated = await transitionConsultation(req.params.id, userId, ConsultationStatus.ACCEPTED, {
    allowedFrom: [ConsultationStatus.PENDING],
    architectOnly: true,
    notificationTitle: "Consultation Accepted",
    notificationMessage: () => "Your consultation request has been accepted by the architect.",
  });

  res.status(200).json(updated);
});

export const startConsultation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const updated = await transitionConsultation(req.params.id, userId, ConsultationStatus.IN_PROGRESS, {
    allowedFrom: [ConsultationStatus.ACCEPTED],
    architectOnly: true,
    notificationTitle: "Consultation Started",
    notificationMessage: () => "Your consultation is now in progress.",
  });

  res.status(200).json(updated);
});

export const completeConsultation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const updated = await transitionConsultation(req.params.id, userId, ConsultationStatus.REVIEW_PENDING, {
    allowedFrom: [ConsultationStatus.IN_PROGRESS],
    architectOnly: true,
    notificationTitle: "Consultation Complete",
    notificationMessage: () => "Your project is complete. Please share your review.",
  });

  res.status(200).json(updated);
});

export const cancelConsultation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const updated = await transitionConsultation(req.params.id, userId, ConsultationStatus.CANCELLED, {
    force: true,
    notificationTitle: "Consultation Cancelled",
    notificationMessage: ({ actorIsArchitect }) =>
      actorIsArchitect
        ? "The architect has cancelled this consultation."
        : "The homeowner has cancelled this consultation.",
  });

  res.status(200).json(updated);
});

export const updateConsultationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (!status) {
    return res.status(400).json({ message: "Missing status field" });
  }

  const mapped = mapStatusInput(String(status));
  if (mapped === ConsultationStatus.ACCEPTED) {
    const updated = await transitionConsultation(id, userId, ConsultationStatus.ACCEPTED, {
      allowedFrom: [ConsultationStatus.PENDING],
      architectOnly: true,
      notificationTitle: "Consultation Accepted",
      notificationMessage: () => "Your consultation request has been accepted by the architect.",
    });
    return res.status(200).json(updated);
  }

  if (mapped === ConsultationStatus.IN_PROGRESS) {
    const updated = await transitionConsultation(id, userId, ConsultationStatus.IN_PROGRESS, {
      allowedFrom: [ConsultationStatus.ACCEPTED],
      architectOnly: true,
      notificationTitle: "Consultation Started",
      notificationMessage: () => "Your consultation is now in progress.",
    });
    return res.status(200).json(updated);
  }

  if (mapped === ConsultationStatus.REVIEW_PENDING || mapped === ConsultationStatus.COMPLETED) {
    const updated = await transitionConsultation(id, userId, ConsultationStatus.REVIEW_PENDING, {
      allowedFrom: [ConsultationStatus.IN_PROGRESS],
      architectOnly: true,
      notificationTitle: "Consultation Complete",
      notificationMessage: () => "Your project is complete. Please share your review.",
    });
    return res.status(200).json(updated);
  }

  if (mapped === ConsultationStatus.CANCELLED) {
    const updated = await transitionConsultation(id, userId, ConsultationStatus.CANCELLED, {
      force: true,
      notificationTitle: "Consultation Cancelled",
      notificationMessage: ({ actorIsArchitect }) =>
        actorIsArchitect
          ? "The architect has cancelled this consultation."
          : "The homeowner has cancelled this consultation.",
    });
    return res.status(200).json(updated);
  }

  return res.status(400).json({ message: "Unsupported status transition" });
});