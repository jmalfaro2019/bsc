import { z } from "zod";

export const activitySchema = z.object({
  id: z.string(),
  name: z.string(),
  weightage: z.number(),
  progress: z.number().min(0).max(100),
  responsibleProcess: z.string(),
  complianceDate: z.string(),
  realizedActivities: z.string(),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  weightage: z.number(),
  strategy: z.string(),
  detail: z.string(),
  activities: z.array(activitySchema),
});

export const perspectiveSchema = z.object({
  id: z.string(),
  name: z.string(),
  objective: z.string(),
  weightage: z.number(),
  projects: z.array(projectSchema),
});

export const bscDataSchema = z.object({
  perspectives: z.array(perspectiveSchema),
});

export type Activity = z.infer<typeof activitySchema>;
export type Project = z.infer<typeof projectSchema>;
export type Perspective = z.infer<typeof perspectiveSchema>;
export type BSCData = z.infer<typeof bscDataSchema>;

// Create schemas (without id)
export const createActivitySchema = activitySchema.omit({ id: true });
export const createProjectSchema = projectSchema.omit({ id: true, activities: true });
export const createPerspectiveSchema = perspectiveSchema.omit({ id: true, projects: true });

// Update schemas (all fields optional except id)
export const updateActivitySchema = activitySchema.partial().required({ id: true });
export const updateProjectSchema = projectSchema.partial().required({ id: true });
export const updatePerspectiveSchema = perspectiveSchema.partial().required({ id: true });

// Progress-only update
export const progressUpdateSchema = z.object({
  progress: z.number().min(0).max(100),
});

// Batch progress update
export const batchProgressUpdateSchema = z.object({
  updates: z.array(
    z.object({
      activityId: z.string(),
      progress: z.number().min(0).max(100),
    }),
  ),
});

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type CreateActivity = z.infer<typeof createActivitySchema>;
export type CreateProject = z.infer<typeof createProjectSchema>;
export type CreatePerspective = z.infer<typeof createPerspectiveSchema>;
export type ProgressUpdate = z.infer<typeof progressUpdateSchema>;
export type BatchProgressUpdate = z.infer<typeof batchProgressUpdateSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;

// Snapshot / ProgressRecord schemas
export const snapshotSchema = z.object({
  id: z.string(),
  label: z.string().nullable(),
  date: z.string().or(z.date()),
  createdAt: z.string().or(z.date()),
});

export const createSnapshotSchema = z.object({
  label: z.string().min(1).max(100).optional(),
});

export const progressRecordSchema = z.object({
  id: z.string(),
  activityId: z.string(),
  progress: z.number().min(0).max(100),
  recordedAt: z.string().or(z.date()),
  snapshotId: z.string().nullable(),
});

export type Snapshot = z.infer<typeof snapshotSchema>;
export type CreateSnapshot = z.infer<typeof createSnapshotSchema>;
export type ProgressRecord = z.infer<typeof progressRecordSchema>;

// Avance / AvanceItem schemas
export const avanceItemSchema = z.object({
  id: z.string(),
  avanceId: z.string(),
  activityId: z.string(),
  progress: z.number().min(0).max(100),
  description: z.string().nullable().optional(),
  createdAt: z.string().or(z.date()),
});

export const createAvanceItemSchema = z.object({
  activityId: z.string(),
  progress: z.number().min(0).max(100),
  description: z.string().optional(),
});

export const avanceSchema = z.object({
  id: z.string(),
  snapshotId: z.string().nullable().optional(),
  date: z.string().or(z.date()),
  createdAt: z.string().or(z.date()),
  items: z.array(avanceItemSchema),
});

export const createAvanceSchema = z.object({
  items: z.array(createAvanceItemSchema),
});

export type AvanceItem = z.infer<typeof avanceItemSchema>;
export type CreateAvanceItem = z.infer<typeof createAvanceItemSchema>;
export type Avance = z.infer<typeof avanceSchema>;
export type CreateAvance = z.infer<typeof createAvanceSchema>;

// User / role schemas
export const roleSchema = z.enum(["admin", "lector"]);

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: roleSchema,
  createdAt: z.string().or(z.date()),
});

export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  role: roleSchema,
});

export const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  password: z.string().min(6).max(100).optional(),
  role: roleSchema.optional(),
});

export type Role = z.infer<typeof roleSchema>;
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

// Weighted progress computation (single source of truth for backend and frontend)
export interface WeightedProgressPerspective {
  weightage: number;
  projects: Array<{
    weightage: number;
    activities: Array<{ id: string; progress: number }>;
  }>;
}

export function computePerspectiveProgress(
  perspective: Omit<WeightedProgressPerspective, "weightage">,
  progressMap?: Map<string, number>,
): number {
  const totalProjectWeight = perspective.projects.reduce((s, p) => s + p.weightage, 0);
  if (totalProjectWeight === 0) return 0;

  return perspective.projects.reduce((pSum, project) => {
    const projProgress =
      project.activities.length > 0
        ? project.activities.reduce((aSum, act) => {
            const prog = progressMap
              ? (progressMap.get(act.id) ?? act.progress)
              : act.progress;
            return aSum + prog;
          }, 0) / project.activities.length
        : 0;
    return pSum + projProgress * (project.weightage / totalProjectWeight);
  }, 0);
}

export function computeWeightedProgress(
  perspectives: WeightedProgressPerspective[],
  progressMap?: Map<string, number>,
): number {
  const totalPerspectiveWeight = perspectives.reduce((s, p) => s + p.weightage, 0);
  if (totalPerspectiveWeight === 0) return 0;

  const globalProgress = perspectives.reduce(
    (sum, persp) =>
      sum +
      computePerspectiveProgress(persp, progressMap) *
        (persp.weightage / totalPerspectiveWeight),
    0,
  );

  return Math.round(globalProgress * 10) / 10;
}