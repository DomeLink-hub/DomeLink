import type { Request, Response } from "express";

export const handleAIRequest = async (req: Request, res: Response) => {
  // Dummy AI handler for now
  res.status(200).json({ message: "AI response placeholder" });
};
