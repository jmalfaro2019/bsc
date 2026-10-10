import { Router } from "express";
import { prisma } from "../app";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { getParam } from "../utils/params";
import { createAvanceSchema } from "bsc-shared";

const router = Router();

router.use(authMiddleware);

// POST /api/avances — create avance + items, update activity progress
router.post(
  "/",
  requireRole("admin"),
  validate(createAvanceSchema),
  asyncHandler(async (req, res) => {
    const { items } = req.body;
    const avance = await prisma.$transaction(async (tx) => {
      const av = await tx.avance.create({
        data: { date: new Date() },
      });

      for (const item of items as {
        activityId: string;
        progress: number;
        description?: string;
      }[]) {
        await tx.activity.update({
          where: { id: item.activityId },
          data: { progress: item.progress },
        });
        await tx.avanceItem.create({
          data: {
            avanceId: av.id,
            activityId: item.activityId,
            progress: item.progress,
            description: item.description || null,
          },
        });
      }

      return tx.avance.findUnique({
        where: { id: av.id },
        include: { items: true },
      });
    });
    res.status(201).json(avance);
  }),
);

// GET /api/avances — list all avances (newest first), optional ?snapshotId= or ?current=true
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const snapshotId = req.query.snapshotId as string | undefined;
    const current = req.query.current === "true";
    const avances = await prisma.avance.findMany({
      where: snapshotId ? { snapshotId } : current ? { snapshotId: null } : undefined,
      orderBy: { date: "desc" },
      include: {
        items: {
          include: {
            activity: { select: { id: true, name: true } },
          },
        },
      },
    });
    res.json(avances);
  }),
);

// GET /api/avances/:id — get avance with items
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = getParam(req, "id");
    const avance = await prisma.avance.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            activity: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!avance) {
      res.status(404).json({ error: "Avance not found" });
      return;
    }
    res.json(avance);
  }),
);

// DELETE /api/avances/:id — delete avance (cascades items)
router.delete(
  "/:id",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const id = getParam(req, "id");
    await prisma.avance.delete({ where: { id } });
    res.status(204).end();
  }),
);

export default router;
