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

type PerspectiveWithNested = {
  weightage: number;
  projects: Array<{
    weightage: number;
    activities: Array<{ id: string; progress: number }>;
  }>;
};

function computeWeightedProgress(
  perspectives: PerspectiveWithNested[],
  progressMap?: Map<string, number>,
): number {
  const totalPerspectiveWeight = perspectives.reduce((s, p) => s + p.weightage, 0);
  if (totalPerspectiveWeight === 0) return 0;

  const globalProgress = perspectives.reduce((sum, persp) => {
    const totalProjectWeight = persp.projects.reduce((s, p) => s + p.weightage, 0);
    const perspProgress = totalProjectWeight === 0 ? 0 : persp.projects.reduce((pSum, project) => {
      const projProgress = project.activities.length > 0
        ? project.activities.reduce((aSum, act) => {
            const prog = progressMap ? (progressMap.get(act.id) ?? act.progress) : act.progress;
            return aSum + prog;
          }, 0) / project.activities.length
        : 0;
      return pSum + projProgress * (project.weightage / totalProjectWeight);
    }, 0);
    return sum + perspProgress * (persp.weightage / totalPerspectiveWeight);
  }, 0);

  return Math.round(globalProgress * 10) / 10;
}

// GET /api/snapshots/progress-trend — aggregated progress per snapshot (for trend chart)
router.get("/progress-trend", async (_req: AuthRequest, res: Response) => {
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

      await tx.avance.updateMany({
        where: { snapshotId: null },
        data: { snapshotId: snap.id },
      });

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