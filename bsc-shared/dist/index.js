"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.batchProgressUpdateSchema = exports.progressUpdateSchema = exports.updatePerspectiveSchema = exports.updateProjectSchema = exports.updateActivitySchema = exports.createPerspectiveSchema = exports.createProjectSchema = exports.createActivitySchema = exports.bscDataSchema = exports.perspectiveSchema = exports.projectSchema = exports.activitySchema = void 0;
const zod_1 = require("zod");
exports.activitySchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    weightage: zod_1.z.number(),
    progress: zod_1.z.number().min(0).max(100),
    responsibleProcess: zod_1.z.string(),
    complianceDate: zod_1.z.string(),
    realizedActivities: zod_1.z.string(),
});
exports.projectSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    weightage: zod_1.z.number(),
    strategy: zod_1.z.string(),
    detail: zod_1.z.string(),
    activities: zod_1.z.array(exports.activitySchema),
});
exports.perspectiveSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    objective: zod_1.z.string(),
    weightage: zod_1.z.number(),
    projects: zod_1.z.array(exports.projectSchema),
});
exports.bscDataSchema = zod_1.z.object({
    perspectives: zod_1.z.array(exports.perspectiveSchema),
});
// Create schemas (without id)
exports.createActivitySchema = exports.activitySchema.omit({ id: true });
exports.createProjectSchema = exports.projectSchema.omit({ id: true, activities: true });
exports.createPerspectiveSchema = exports.perspectiveSchema.omit({ id: true, projects: true });
// Update schemas (all fields optional except id)
exports.updateActivitySchema = exports.activitySchema.partial().required({ id: true });
exports.updateProjectSchema = exports.projectSchema.partial().required({ id: true });
exports.updatePerspectiveSchema = exports.perspectiveSchema.partial().required({ id: true });
// Progress-only update
exports.progressUpdateSchema = zod_1.z.object({
    progress: zod_1.z.number().min(0).max(100),
});
// Batch progress update
exports.batchProgressUpdateSchema = zod_1.z.object({
    updates: zod_1.z.array(zod_1.z.object({
        activityId: zod_1.z.string(),
        progress: zod_1.z.number().min(0).max(100),
    })),
});
// Auth schemas
exports.loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1),
    password: zod_1.z.string().min(1),
});
