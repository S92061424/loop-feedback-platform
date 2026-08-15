import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

// Extend Express's Request type so TypeScript knows about req.user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    workspaceId: string;
    role: string;
  };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

 const token = authHeader.split(" ")[1];

if (!token) {
  return res.status(401).json({ error: "No token provided" });
}

try {
  const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};