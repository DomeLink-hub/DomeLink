import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError("Route not found", 404));
};

export const errorHandler = (error: unknown, _req: Request, res: Response, next: NextFunction) => {
  void next;
  const requestMeta = {
    method: _req.method,
    path: _req.path,
    userId: _req.auth?.sub,
  };

  if (error instanceof ZodError) {
    logger.warn("Validation failed", { ...requestMeta, issues: error.issues });
    return res.status(400).json({
      status: 400,
      error: "Validation failed",
      details: error.issues,
    });
  }

  if (error instanceof AppError) {
    logger.warn("Handled application error", { ...requestMeta, message: error.message, statusCode: error.statusCode });
    return res.status(error.statusCode).json({
      status: error.statusCode,
      error: error.message,
      details: error.stack,
    });
  }

  logger.error("Unhandled server error", {
    ...requestMeta,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  return res.status(500).json({
    status: 500,
    error: "Internal server error",
    details: error instanceof Error ? error.stack : undefined,
  });
};
