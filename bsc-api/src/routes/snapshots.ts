import { Router, Response } from "express";
import { prisma } from "../app";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createSnapshotSchema } from "bsc-shared";

const router = Router();

router.use(authMiddleware);

type Params = Record<string, string>;

function getParam(req: AuthRequest, key: string): string {
  const val = req.params[key];
  return Array.isArray(val) ? val[0] : (val ?? "");
}

// GET /api/snapshots — list all snapshots (newest first)
router.get("/", async (_req: AuthRequest, res: Response) => {
  const snapshots = await prisma.snapshot.findMany({
    orderBy: { date: "desc" },
  });
  res.json(snapshots);
});

// GET /api/snapshots/progress-trend — aggregated progress per snapshot (for trend chart)
router.get("/progress-trend", async (_req: AuthRequest, res: Response) => {
  const snapshots = await prisma.snapshot.findMany({
    orderBy: { date: "asc" },
    include: { progressRecords: true },
  });

  const currentActivities = await prisma.activity.findMany();

  const trend = snapshots.map((snap) => {
    const progressMap = new Map(
      snap.progressRecords.map((r) => [r.activityId, r.progress]),
    );
    const totalProgress = currentActivities.length > 0
      ? currentActivities.reduce((sum, a) => {
          const recorded = progressMap.get(a.id);
          return sum + (recorded !== undefined ? recorded : a.progress);
        }, 0) / currentActivities.length
      : 0;

    return {
      id: snap.id,
      label: snap.label,
      date: snap.date.toISOString(),
      avgProgress: Math.round(totalProgress * 10) / 10,
    };
  });

  trend.push({
    id: "current",
    label: "Actual",
    date: new Date().toISOString(),
    avgProgress: Math.round(
      currentActivities.length > 0
        ? (currentActivities.reduce((s, a) => s + a.progress, 0) / currentActivities.length) * 10
        : 0,
    ) / 10,
  });

  res.json(trend);
});

// GET /api/snapshots/:id — get snapshot with its progress records
router.get("/:id", async (req: AuthRequest, res: Response) => {
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
});

// POST /api/snapshots — create snapshot (captures current progress of all activities)
router.post(
  "/",
  validate(createSnapshotSchema),
  async (req: AuthRequest, res: Response) => {
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

      return snap;
    });

    res.status(201).json(snapshot);
  },
);

// DELETE /api/snapshots/:id — delete a snapshot and its progress records
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const id = getParam(req, "id");
  try {
    await prisma.progressRecord.deleteMany({
      where: { snapshotId: id },
    });
    await prisma.snapshot.delete({ where: { id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Snapshot not found" });
  }
});

export default router;