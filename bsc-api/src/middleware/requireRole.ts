import { NextFunction, Response } from "express";
import { prisma } from "../app";
import { AuthRequest } from "./auth";

export function requireRole(...roles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { role: true },
      });

      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!roles.includes(user.role)) {
        res.status(403).json({ error: "Forbidden: insufficient permissions" });
        return;
      }

      req.role = user.role;
      next();
    } catch (err) {
      next(err);
    }
  };
}
