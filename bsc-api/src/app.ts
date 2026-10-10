import express from "express";
import cors from "cors";
import helmet from "helmet";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth";
import perspectiveRoutes from "./routes/perspectives";
import snapshotRoutes from "./routes/snapshots";
import avanceRoutes from "./routes/avances";
import userRoutes from "./routes/users";
import { errorHandler } from "./middleware/errorHandler";

export const prisma = new PrismaClient();

const app = express();

app.use(helmet());
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
app.use("/api/snapshots", snapshotRoutes);
app.use("/api/avances", avanceRoutes);
app.use("/api/users", userRoutes);

app.use(errorHandler);

export default app;