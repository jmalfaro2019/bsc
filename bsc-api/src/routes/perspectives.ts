import { Router, Response } from "express";
import { prisma } from "../app";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createPerspectiveSchema,
  createProjectSchema,
  createActivitySchema,
  progressUpdateSchema,
  updatePerspectiveSchema,
  updateProjectSchema,
  updateActivitySchema,
  batchProgressUpdateSchema,
} from "bsc-shared";

const router = Router();

router.use(authMiddleware);

type Params = Record<string, string>;

// PATCH /api/perspectives/batch-progress — update multiple activities at once
router.patch(
  "/batch-progress",
  validate(batchProgressUpdateSchema),
  async (req: AuthRequest, res: Response) => {
    const { updates } = req.body;
    try {
      const results = await prisma.$transaction(
        updates.map((u: { activityId: string; progress: number }) =>
          prisma.activity.update({
            where: { id: u.activityId },
            data: { progress: u.progress },
          }),
        ),
      );
      res.json({ updated: results });
    } catch {
      res.status(400).json({ error: "One or more activities not found" });
    }
  },
);

function getParam(req: AuthRequest, key: string): string {
  const val = req.params[key];
  return Array.isArray(val) ? val[0] : (val ?? "");
}

// GET /api/perspectives — list all with nested projects and activities
router.get("/", async (_req: AuthRequest, res: Response) => {
  const perspectives = await prisma.perspective.findMany({
    orderBy: { order: "asc" },
    include: {
      projects: {
        orderBy: { order: "asc" },
        include: { activities: { orderBy: { order: "asc" } } },
      },
    },
  });
  res.json(perspectives);
});

// GET /api/perspectives/:pid
router.get("/:pid", async (req: AuthRequest, res: Response) => {
  const pid = getParam(req, "pid");
  const perspective = await prisma.perspective.findUnique({
    where: { id: pid },
    include: {
      projects: {
        orderBy: { order: "asc" },
        include: { activities: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!perspective) {
    res.status(404).json({ error: "Perspective not found" });
    return;
  }
  res.json(perspective);
});

// POST /api/perspectives
router.post(
  "/",
  validate(createPerspectiveSchema),
  async (req: AuthRequest, res: Response) => {
    const perspective = await prisma.perspective.create({ data: req.body });
    res.status(201).json(perspective);
  },
);

// PATCH /api/perspectives/:pid
router.patch(
  "/:pid",
  validate(updatePerspectiveSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const pid = getParam(req, "pid");
      const perspective = await prisma.perspective.update({
        where: { id: pid },
        data: req.body,
      });
      res.json(perspective);
    } catch {
      res.status(404).json({ error: "Perspective not found" });
    }
  },
);

// DELETE /api/perspectives/:pid
router.delete("/:pid", async (req: AuthRequest, res: Response) => {
  const pid = getParam(req, "pid");
  try {
    await prisma.perspective.delete({ where: { id: pid } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Perspective not found" });
  }
});

// ── Projects ──

// GET /api/perspectives/:pid/projects
router.get("/:pid/projects", async (req: AuthRequest, res: Response) => {
  const pid = getParam(req, "pid");
  const perspective = await prisma.perspective.findUnique({
    where: { id: pid },
  });
  if (!perspective) {
    res.status(404).json({ error: "Perspective not found" });
    return;
  }
  const projects = await prisma.project.findMany({
    where: { perspectiveId: pid },
    orderBy: { order: "asc" },
    include: { activities: { orderBy: { order: "asc" } } },
  });
  res.json(projects);
});

// POST /api/perspectives/:pid/projects
router.post(
  "/:pid/projects",
  validate(createProjectSchema),
  async (req: AuthRequest, res: Response) => {
    const pid = getParam(req, "pid");
    const perspective = await prisma.perspective.findUnique({
      where: { id: pid },
    });
    if (!perspective) {
      res.status(404).json({ error: "Perspective not found" });
      return;
    }
    const project = await prisma.project.create({
      data: { ...req.body, perspectiveId: pid },
    });
    res.status(201).json(project);
  },
);

// PATCH /api/perspectives/:pid/projects/:prid
router.patch(
  "/:pid/projects/:prid",
  validate(updateProjectSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const prid = getParam(req, "prid");
      const project = await prisma.project.update({
        where: { id: prid },
        data: req.body,
      });
      res.json(project);
    } catch {
      res.status(404).json({ error: "Project not found" });
    }
  },
);

// DELETE /api/perspectives/:pid/projects/:prid
router.delete("/:pid/projects/:prid", async (req: AuthRequest, res: Response) => {
  const prid = getParam(req, "prid");
  try {
    await prisma.project.delete({ where: { id: prid } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Project not found" });
  }
});

// ── Activities ──

// GET /api/perspectives/:pid/projects/:prid/activities
router.get(
  "/:pid/projects/:prid/activities",
  async (req: AuthRequest, res: Response) => {
    const prid = getParam(req, "prid");
    const project = await prisma.project.findUnique({
      where: { id: prid },
    });
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const activities = await prisma.activity.findMany({
      where: { projectId: prid },
      orderBy: { order: "asc" },
    });
    res.json(activities);
  },
);

// POST /api/perspectives/:pid/projects/:prid/activities
router.post(
  "/:pid/projects/:prid/activities",
  validate(createActivitySchema),
  async (req: AuthRequest, res: Response) => {
    const prid = getParam(req, "prid");
    const project = await prisma.project.findUnique({
      where: { id: prid },
    });
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const activity = await prisma.activity.create({
      data: { ...req.body, projectId: prid },
    });
    res.status(201).json(activity);
  },
);

// PATCH /api/perspectives/:pid/projects/:prid/activities/:aid
router.patch(
  "/:pid/projects/:prid/activities/:aid",
  validate(updateActivitySchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const aid = getParam(req, "aid");
      const activity = await prisma.activity.update({
        where: { id: aid },
        data: req.body,
      });
      res.json(activity);
    } catch {
      res.status(404).json({ error: "Activity not found" });
    }
  },
);

// PATCH /api/perspectives/:pid/projects/:prid/activities/:aid/progress
router.patch(
  "/:pid/projects/:prid/activities/:aid/progress",
  validate(progressUpdateSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const aid = getParam(req, "aid");
      const activity = await prisma.activity.update({
        where: { id: aid },
        data: { progress: req.body.progress },
      });
      res.json(activity);
    } catch {
      res.status(404).json({ error: "Activity not found" });
    }
  },
);

// DELETE /api/perspectives/:pid/projects/:prid/activities/:aid
router.delete(
  "/:pid/projects/:prid/activities/:aid",
  async (req: AuthRequest, res: Response) => {
    try {
      const aid = getParam(req, "aid");
      await prisma.activity.delete({ where: { id: aid } });
      res.status(204).end();
    } catch {
      res.status(404).json({ error: "Activity not found" });
    }
  },
);

export default router;