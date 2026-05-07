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