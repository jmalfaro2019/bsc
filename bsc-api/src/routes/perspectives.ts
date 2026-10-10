import { Router } from "express";
import { prisma } from "../app";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { getParam } from "../utils/params";
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

// PATCH /api/perspectives/batch-progress — update multiple activities at once
router.patch(
  "/batch-progress",
  requireRole("admin"),
  validate(batchProgressUpdateSchema),
  asyncHandler(async (req, res) => {
    const { updates } = req.body;
    const results = await prisma.$transaction(async (tx) => {
      const updated = [];
      for (const u of updates as { activityId: string; progress: number }[]) {
        const activity = await tx.activity.update({
          where: { id: u.activityId },
          data: { progress: u.progress },
        });
        await tx.progressRecord.create({
          data: {
            activityId: u.activityId,
            progress: u.progress,
            recordedAt: new Date(),
            snapshotId: null,
          },
        });
        updated.push(activity);
      }
      return updated;
    });
    res.json({ updated: results });
  }),
);

// GET /api/perspectives — list all with nested projects and activities
// Optional ?snapshotId=xxx to reconstruct progress from a snapshot
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const snapshotId = req.query.snapshotId as string | undefined;

    if (snapshotId) {
      const snapshot = await prisma.snapshot.findUnique({
        where: { id: snapshotId },
      });
      if (!snapshot) {
        res.status(404).json({ error: "Snapshot not found" });
        return;
      }

      const records = await prisma.progressRecord.findMany({
        where: { snapshotId },
      });
      const progressMap = new Map(records.map((r) => [r.activityId, r.progress]));

      const perspectives = await prisma.perspective.findMany({
        orderBy: { order: "asc" },
        include: {
          projects: {
            orderBy: { order: "asc" },
            include: { activities: { orderBy: { order: "asc" } } },
          },
        },
      });

      const result = perspectives.map((p) => ({
        ...p,
        projects: p.projects.map((pr) => ({
          ...pr,
          activities: pr.activities.map((a) => ({
            ...a,
            progress: progressMap.has(a.id) ? progressMap.get(a.id)! : a.progress,
          })),
        })),
      }));

      res.json(result);
      return;
    }

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
  }),
);

// GET /api/perspectives/:pid
router.get(
  "/:pid",
  asyncHandler(async (req, res) => {
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
  }),
);

// POST /api/perspectives
router.post(
  "/",
  requireRole("admin"),
  validate(createPerspectiveSchema),
  asyncHandler(async (req, res) => {
    const perspective = await prisma.perspective.create({ data: req.body });
    res.status(201).json(perspective);
  }),
);

// PATCH /api/perspectives/:pid
router.patch(
  "/:pid",
  requireRole("admin"),
  validate(updatePerspectiveSchema),
  asyncHandler(async (req, res) => {
    const pid = getParam(req, "pid");
    const perspective = await prisma.perspective.update({
      where: { id: pid },
      data: req.body,
    });
    res.json(perspective);
  }),
);

// DELETE /api/perspectives/:pid
router.delete(
  "/:pid",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const pid = getParam(req, "pid");
    await prisma.perspective.delete({ where: { id: pid } });
    res.status(204).end();
  }),
);

// ── Projects ──

// GET /api/perspectives/:pid/projects
router.get(
  "/:pid/projects",
  asyncHandler(async (req, res) => {
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
  }),
);

// POST /api/perspectives/:pid/projects
router.post(
  "/:pid/projects",
  requireRole("admin"),
  validate(createProjectSchema),
  asyncHandler(async (req, res) => {
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
  }),
);

// PATCH /api/perspectives/:pid/projects/:prid
router.patch(
  "/:pid/projects/:prid",
  requireRole("admin"),
  validate(updateProjectSchema),
  asyncHandler(async (req, res) => {
    const prid = getParam(req, "prid");
    const project = await prisma.project.update({
      where: { id: prid },
      data: req.body,
    });
    res.json(project);
  }),
);

// DELETE /api/perspectives/:pid/projects/:prid
router.delete(
  "/:pid/projects/:prid",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const prid = getParam(req, "prid");
    await prisma.project.delete({ where: { id: prid } });
    res.status(204).end();
  }),
);

// ── Activities ──

// GET /api/perspectives/:pid/projects/:prid/activities
router.get(
  "/:pid/projects/:prid/activities",
  asyncHandler(async (req, res) => {
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
  }),
);

// POST /api/perspectives/:pid/projects/:prid/activities
router.post(
  "/:pid/projects/:prid/activities",
  requireRole("admin"),
  validate(createActivitySchema),
  asyncHandler(async (req, res) => {
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
  }),
);

// PATCH /api/perspectives/:pid/projects/:prid/activities/:aid
router.patch(
  "/:pid/projects/:prid/activities/:aid",
  requireRole("admin"),
  validate(updateActivitySchema),
  asyncHandler(async (req, res) => {
    const aid = getParam(req, "aid");
    const activity = await prisma.activity.update({
      where: { id: aid },
      data: req.body,
    });
    res.json(activity);
  }),
);

// PATCH /api/perspectives/:pid/projects/:prid/activities/:aid/progress
router.patch(
  "/:pid/projects/:prid/activities/:aid/progress",
  requireRole("admin"),
  validate(progressUpdateSchema),
  asyncHandler(async (req, res) => {
    const aid = getParam(req, "aid");
    const { progress } = req.body;
    const activity = await prisma.$transaction(async (tx) => {
      const updated = await tx.activity.update({
        where: { id: aid },
        data: { progress },
      });
      await tx.progressRecord.create({
        data: {
          activityId: aid,
          progress,
          recordedAt: new Date(),
          snapshotId: null,
        },
      });
      return updated;
    });
    res.json(activity);
  }),
);

// DELETE /api/perspectives/:pid/projects/:prid/activities/:aid
router.delete(
  "/:pid/projects/:prid/activities/:aid",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const aid = getParam(req, "aid");
    await prisma.activity.delete({ where: { id: aid } });
    res.status(204).end();
  }),
);

export default router;
