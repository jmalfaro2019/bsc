import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../app";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { getParam } from "../utils/params";
import { createUserSchema, updateUserSchema } from "bsc-shared";

const router = Router();

router.use(authMiddleware, requireRole("admin"));

const userSelect = {
  id: true,
  username: true,
  role: true,
  createdAt: true,
} as const;

// GET /api/users — list all users
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      select: userSelect,
      orderBy: { createdAt: "asc" },
    });
    res.json(users);
  }),
);

// POST /api/users — create user
router.post(
  "/",
  validate(createUserSchema),
  asyncHandler(async (req, res) => {
    const { username, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashed, role },
      select: userSelect,
    });
    res.status(201).json(user);
  }),
);

// PATCH /api/users/:id — update username, password or role
router.patch(
  "/:id",
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    const id = getParam(req, "id");
    const { username, password, role } = req.body;

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (role && role !== "admin" && target.role === "admin") {
      const adminCount = await prisma.user.count({ where: { role: "admin" } });
      if (adminCount <= 1) {
        res.status(400).json({ error: "Cannot demote the last admin" });
        return;
      }
    }

    const data: { username?: string; password?: string; role?: string } = {};
    if (username) data.username = username;
    if (role) data.role = role;
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
    res.json(user);
  }),
);

// DELETE /api/users/:id — delete user
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = getParam(req, "id");

    if (id === req.userId) {
      res.status(400).json({ error: "Cannot delete your own account" });
      return;
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (target.role === "admin") {
      const adminCount = await prisma.user.count({ where: { role: "admin" } });
      if (adminCount <= 1) {
        res.status(400).json({ error: "Cannot delete the last admin" });
        return;
      }
    }

    await prisma.user.delete({ where: { id } });
    res.status(204).end();
  }),
);

export default router;
