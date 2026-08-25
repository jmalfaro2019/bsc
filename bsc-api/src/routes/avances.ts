import { Router, Response } from "express";
import { prisma } from "../app";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createAvanceSchema } from "bsc-shared";

const router = Router();

router.use(authMiddleware);

type Params = Record<string, string>;

function getParam(req: AuthRequest, key: string): string {
  const val = req.params[key];
  return Array.isArray(val) ? val[0] : (val ?? "");
}

// POST /api/avances — create avance + items, update activity progress
router.post(
  "/",
  validate(createAvanceSchema),
  async (req: AuthRequest, res: Response) => {
    const { items } = req.body;
    try {
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
    } catch {
      res.status(400).json({ error: "One or more activities not found" });
    }
  },
);

// GET /api/avances — list all avances (newest first), optional ?snapshotId=
router.get("/", async (req: AuthRequest, res: Response) => {
  const snapshotId = req.query.snapshotId as string | undefined;
  const avances = await prisma.avance.findMany({
    where: snapshotId ? { snapshotId } : undefined,
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
});

// GET /api/avances/:id — get avance with items
router.get("/:id", async (req: AuthRequest, res: Response) => {
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
});

// DELETE /api/avances/:id — delete avance (cascades items)
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const id = getParam(req, "id");
  try {
    await prisma.avance.delete({ where: { id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Avance not found" });
  }
});

export default router;
