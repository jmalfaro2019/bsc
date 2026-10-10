import { Router } from "express";
import { prisma } from "../app";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { getParam } from "../utils/params";
import { computeWeightedProgress, createSnapshotSchema } from "bsc-shared";

const router = Router();

router.use(authMiddleware);

// GET /api/snapshots — list all snapshots (newest first)
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const snapshots = await prisma.snapshot.findMany({
      orderBy: { date: "desc" },
    });
    res.json(snapshots);
  }),
);

// GET /api/snapshots/progress-trend — aggregated progress per snapshot (for trend chart)
router.get(
  "/progress-trend",
  asyncHandler(async (_req, res) => {
    const snapshots = await prisma.snapshot.findMany({
      orderBy: { date: "asc" },
      include: { progressRecords: true },
    });

    const perspectives = await prisma.perspective.findMany({
      orderBy: { order: "asc" },
      include: {
        projects: {
          orderBy: { order: "asc" },
          include: { activities: { orderBy: { order: "asc" } } },
        },
      },
    });

    const trend = snapshots.map((snap) => {
      const progressMap = new Map(
        snap.progressRecords.map((r) => [r.activityId, r.progress]),
      );
      return {
        id: snap.id,
        label: snap.label,
        date: snap.date.toISOString(),
        avgProgress: computeWeightedProgress(perspectives, progressMap),
      };
    });

    trend.push({
      id: "current",
      label: "Actual",
      date: new Date().toISOString(),
      avgProgress: computeWeightedProgress(perspectives),
    });

    res.json(trend);
  }),
);

// GET /api/snapshots/:id — get snapshot with its progress records
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = getParam(req, "id");
    const snapshot = await prisma.snapshot.findUnique({
      where: { id },
      include: { progressRecords: true },
    });
    if (!snapshot) {
      res.status(404).json({ error: "Snapshot not found" });
      return;
    }
    res.json(snapshot);
  }),
);

// POST /api/snapshots — create snapshot (captures current progress of all activities)
router.post(
  "/",
  requireRole("admin"),
  validate(createSnapshotSchema),
  asyncHandler(async (req, res) => {
    const { label } = req.body;
    const now = new Date();

    const snapshot = await prisma.$transaction(async (tx) => {
      const snap = await tx.snapshot.create({
        data: {
          label: label ?? null,
          date: now,
        },
      });

      const activities = await tx.activity.findMany();
      if (activities.length > 0) {
        await tx.progressRecord.createMany({
          data: activities.map((a) => ({
            activityId: a.id,
            progress: a.progress,
            recordedAt: now,
            snapshotId: snap.id,
          })),
        });
      }

      await tx.avance.updateMany({
        where: { snapshotId: null },
        data: { snapshotId: snap.id },
      });

      return snap;
    });

    res.status(201).json(snapshot);
  }),
);

// DELETE /api/snapshots/:id — delete a snapshot and its progress records
router.delete(
  "/:id",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const id = getParam(req, "id");
    await prisma.$transaction([
      prisma.progressRecord.deleteMany({ where: { snapshotId: id } }),
      prisma.snapshot.delete({ where: { id } }),
    ]);
    res.status(204).end();
  }),
);

export default router;
