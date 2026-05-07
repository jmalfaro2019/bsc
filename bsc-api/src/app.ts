import express from "express";
import cors from "cors";
import { PrismaClient } from "./generated/prisma";
import authRoutes from "./routes/auth";
import perspectiveRoutes from "./routes/perspectives";
import { errorHandler } from "./middleware/errorHandler";

export const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/perspectives", perspectiveRoutes);

app.use(errorHandler);

export default app;