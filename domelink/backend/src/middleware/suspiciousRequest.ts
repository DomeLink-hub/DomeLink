import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

const SUSPICIOUS_PATTERNS = [
  /(\.\.\/|\.\.\\)/,                         // Path traversal
  /(<script>|<\/script>|javascript:)/i,      // XSS typical vectors
  /(\bselect\b|\bunion\b|\binsert\b|\bdrop\b).*\bfrom\b/i, // Obvious SQLi
];

export const suspiciousRequestDetector = (req: Request, res: Response, next: NextFunction) => {
  const url = req.originalUrl || req.url;
  
  // Basic query inspection
  let isSuspicious = SUSPICIOUS_PATTERNS.some(p => p.test(url));

  // Inspect body briefly if parsed
  if (!isSuspicious && req.body && typeof req.body === "string") {
      isSuspicious = SUSPICIOUS_PATTERNS.some(p => p.test(req.body));
  } else if (!isSuspicious && req.body && typeof req.body === "object") {
      const bodyStr = JSON.stringify(req.body);
      isSuspicious = SUSPICIOUS_PATTERNS.some(p => p.test(bodyStr));
  }

  if (isSuspicious) {
    logger.warn("Suspicious request blocked", { 
      ip: req.ip, 
      path: url, 
      method: req.method 
    });
    return res.status(403).json({ error: "Access denied" });
  }

  next();
};
