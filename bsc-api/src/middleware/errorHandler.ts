import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation error",
      details: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      res.status(404).json({ error: "Record not found" });
      return;
    }
    if (err.code === "P2002") {
      res.status(409).json({ error: "Duplicate value: unique constraint violated" });
      return;
    }
    if (err.code === "P2003") {
      res.status(409).json({ error: "Related record constraint violated" });
      return;
    }
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
