// Global augmentation for Express Request used by the app.
// Keep this file minimal and avoid importing other modules so TypeScript
// picks up the global augmentation reliably.

declare global {
  namespace Express {
    interface Request {
      auth?: { sub?: string; email?: string };
      user?: {
        id: string;
        name: string;
        email: string;
        role?: string;
        avatar?: string | null;
        city?: string;
        projectType?: string;
        plotSize?: number;
        budgetMin?: number;
        budgetMax?: number;
        preferredStyles?: any;
        vastuPreference?: boolean;
        timeline?: string;
        familySize?: number;
        projectStage?: string;
        onboardingCompleted?: boolean;
      };
      file?: Express.Multer.File;
      rawBody?: Buffer;
    }
  }
}

export {};