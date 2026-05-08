import express from "express";
import cors from "cors";
import { PrismaClient } from "./generated/prisma";
import authRoutes from "./routes/auth";
import perspectiveRoutes from "./routes/perspectives";
import { errorHandler } from "./middleware/errorHandler";

export const prisma = new PrismaClient();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/perspectives", perspectiveRoutes);

app.use(errorHandler);

export default app;