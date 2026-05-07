import { z } from "zod";
export declare const activitySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    weightage: z.ZodNumber;
    progress: z.ZodNumber;
    responsibleProcess: z.ZodString;
    complianceDate: z.ZodString;
    realizedActivities: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    weightage: number;
    progress: number;
    responsibleProcess: string;
    complianceDate: string;
    realizedActivities: string;
}, {
    id: string;
    name: string;
    weightage: number;
    progress: number;
    responsibleProcess: string;
    complianceDate: string;
    realizedActivities: string;
}>;
export declare const projectSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    weightage: z.ZodNumber;
    strategy: z.ZodString;
    detail: z.ZodString;
    activities: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        weightage: z.ZodNumber;
        progress: z.ZodNumber;
        responsibleProcess: z.ZodString;
        complianceDate: z.ZodString;
        realizedActivities: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        weightage: number;
        progress: number;
        responsibleProcess: string;
        complianceDate: string;
        realizedActivities: string;
    }, {
        id: string;
        name: string;
        weightage: number;
        progress: number;
        responsibleProcess: string;
        complianceDate: string;
        realizedActivities: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    weightage: number;
    strategy: string;
    detail: string;
    activities: {
        id: string;
        name: string;
        weightage: number;
        progress: number;
        responsibleProcess: string;
        complianceDate: string;
        realizedActivities: string;
    }[];
}, {
    id: string;
    name: string;
    weightage: number;
    strategy: string;
    detail: string;
    activities: {
        id: string;
        name: string;
        weightage: number;
        progress: number;
        responsibleProcess: string;
        complianceDate: string;
        realizedActivities: string;
    }[];
}>;
export declare const perspectiveSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    objective: z.ZodString;
    weightage: z.ZodNumber;
    projects: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        weightage: z.ZodNumber;
        strategy: z.ZodString;
        detail: z.ZodString;
        activities: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            weightage: z.ZodNumber;
            progress: z.ZodNumber;
            responsibleProcess: z.ZodString;
            complianceDate: z.ZodString;
            realizedActivities: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            weightage: number;
            progress: number;
            responsibleProcess: string;
            complianceDate: string;
            realizedActivities: string;
        }, {
            id: string;
            name: string;
            weightage: number;
            progress: number;
            responsibleProcess: string;
            complianceDate: string;
            realizedActivities: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        weightage: number;
        strategy: string;
        detail: string;
        activities: {
            id: string;
            name: string;
            weightage: number;
            progress: number;
            responsibleProcess: string;
            complianceDate: string;
            realizedActivities: string;
        }[];
    }, {
        id: string;
        name: string;
        weightage: number;
        strategy: string;
        detail: string;
        activities: {
            id: string;
            name: string;
            weightage: number;
            progress: number;
            responsibleProcess: string;
            complianceDate: string;
            realizedActivities: string;
        }[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    weightage: number;
    objective: string;
    projects: {
        id: string;
        name: string;
        weightage: number;
        strategy: string;
        detail: string;
        activities: {
            id: string;
            name: string;
            weightage: number;
            progress: number;
            responsibleProcess: string;
            complianceDate: string;
            realizedActivities: string;
        }[];
    }[];
}, {
    id: string;
    name: string;
    weightage: number;
    objective: string;
    projects: {
        id: string;
        name: string;
        weightage: number;
        strategy: string;
        detail: string;
        activities: {
            id: string;
            name: string;
            weightage: number;
            progress: number;
            responsibleProcess: string;
            complianceDate: string;
            realizedActivities: string;
        }[];
    }[];
}>;
export declare const bscDataSchema: z.ZodObject<{
    perspectives: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        objective: z.ZodString;
        weightage: z.ZodNumber;
        projects: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            weightage: z.ZodNumber;
            strategy: z.ZodString;
            detail: z.ZodString;
            activities: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                weightage: z.ZodNumber;
                progress: z.ZodNumber;
                responsibleProcess: z.ZodString;
                complianceDate: z.ZodString;
                realizedActivities: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                weightage: number;
                progress: number;
                responsibleProcess: string;
                complianceDate: string;
                realizedActivities: string;
            }, {
                id: string;
                name: string;
                weightage: number;
                progress: number;
                responsibleProcess: string;
                complianceDate: string;
                realizedActivities: string;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            weightage: number;
            strategy: string;
            detail: string;
            activities: {
                id: string;
                name: string;
                weightage: number;
                progress: number;
                responsibleProcess: string;
                complianceDate: string;
                realizedActivities: string;
            }[];
        }, {
            id: string;
            name: string;
            weightage: number;
            strategy: string;
            detail: string;
            activities: {
                id: string;
                name: string;
                weightage: number;
                progress: number;
                responsibleProcess: string;
                complianceDate: string;
                realizedActivities: string;
            }[];
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        weightage: number;
        objective: string;
        projects: {
            id: string;
            name: string;
            weightage: number;
            strategy: string;
            detail: string;
            activities: {
                id: string;
                name: string;
                weightage: number;
                progress: number;
                responsibleProcess: string;
                complianceDate: string;
                realizedActivities: string;
            }[];
        }[];
    }, {
        id: string;
        name: string;
        weightage: number;
        objective: string;
        projects: {
            id: string;
            name: string;
            weightage: number;
            strategy: string;
            detail: string;
            activities: {
                id: string;
                name: string;
                weightage: number;
                progress: number;
                responsibleProcess: string;
                complianceDate: string;
                realizedActivities: string;
            }[];
        }[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    perspectives: {
        id: string;
        name: string;
        weightage: number;
        objective: string;
        projects: {
            id: string;
            name: string;
            weightage: number;
            strategy: string;
            detail: string;
            activities: {
                id: string;
                name: string;
                weightage: number;
                progress: number;
                responsibleProcess: string;
                complianceDate: string;
                realizedActivities: string;
            }[];
        }[];
    }[];
}, {
    perspectives: {
        id: string;
        name: string;
        weightage: number;
        objective: string;
        projects: {
            id: string;
            name: string;
            weightage: number;
            strategy: string;
            detail: string;
            activities: {
                id: string;
                name: string;
                weightage: number;
                progress: number;
                responsibleProcess: string;
                complianceDate: string;
                realizedActivities: string;
            }[];
        }[];
    }[];
}>;
export type Activity = z.infer<typeof activitySchema>;
export type Project = z.infer<typeof projectSchema>;
export type Perspective = z.infer<typeof perspectiveSchema>;
export type BSCData = z.infer<typeof bscDataSchema>;
export declare const createActivitySchema: z.ZodObject<Omit<{
    id: z.ZodString;
    name: z.ZodString;
    weightage: z.ZodNumber;
    progress: z.ZodNumber;
    responsibleProcess: z.ZodString;
    complianceDate: z.ZodString;
    realizedActivities: z.ZodString;
}, "id">, "strip", z.ZodTypeAny, {
    name: string;
    weightage: number;
    progress: number;
    responsibleProcess: string;
    complianceDate: string;
    realizedActivities: string;
}, {
    name: string;
    weightage: number;
    progress: number;
    responsibleProcess: string;
    complianceDate: string;
    realizedActivities: string;
}>;
export declare const createProjectSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    name: z.ZodString;
    weightage: z.ZodNumber;
    strategy: z.ZodString;
    detail: z.ZodString;
    activities: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        weightage: z.ZodNumber;
        progress: z.ZodNumber;
        responsibleProcess: z.ZodString;
        complianceDate: z.ZodString;
        realizedActivities: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        weightage: number;
        progress: number;
        responsibleProcess: string;
        complianceDate: string;
        realizedActivities: string;
    }, {
        id: string;
        name: string;
        weightage: number;
        progress: number;
        responsibleProcess: string;
        complianceDate: string;
        realizedActivities: string;
    }>, "many">;
}, "id" | "activities">, "strip", z.ZodTypeAny, {
    name: string;
    weightage: number;
    strategy: string;
    detail: string;
}, {
    name: string;
    weightage: number;
    strategy: string;
    detail: string;
}>;
export declare const createPerspectiveSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    name: z.ZodString;
    objective: z.ZodString;
    weightage: z.ZodNumber;
    projects: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        weightage: z.ZodNumber;
        strategy: z.ZodString;
        detail: z.ZodString;
        activities: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            weightage: z.ZodNumber;
            progress: z.ZodNumber;
            responsibleProcess: z.ZodString;
            complianceDate: z.ZodString;
            realizedActivities: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            weightage: number;
            progress: number;
            responsibleProcess: string;
            complianceDate: string;
            realizedActivities: string;
        }, {
            id: string;
            name: string;
            weightage: number;
            progress: number;
            responsibleProcess: string;
            complianceDate: string;
            realizedActivities: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        weightage: number;
        strategy: string;
        detail: string;
        activities: {
            id: string;
            name: string;
            weightage: number;
            progress: number;
            responsibleProcess: string;
            complianceDate: string;
            realizedActivities: string;
        }[];
    }, {
        id: string;
        name: string;
        weightage: number;
        strategy: string;
        detail: string;
        activities: {
            id: string;
            name: string;
            weightage: number;
            progress: number;
            responsibleProcess: string;
            complianceDate: string;
            realizedActivities: string;
        }[];
    }>, "many">;
}, "id" | "projects">, "strip", z.ZodTypeAny, {
    name: string;
    weightage: number;
    objective: string;
}, {
    name: string;
    weightage: number;
    objective: string;
}>;
export declare const updateActivitySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    weightage: z.ZodOptional<z.ZodNumber>;
    progress: z.ZodOptional<z.ZodNumber>;
    responsibleProcess: z.ZodOptional<z.ZodString>;
    complianceDate: z.ZodOptional<z.ZodString>;
    realizedActivities: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name?: string | undefined;
    weightage?: number | undefined;
    progress?: number | undefined;
    responsibleProcess?: string | undefined;
    complianceDate?: string | undefined;
    realizedActivities?: string | undefined;
}, {
    id: string;
    name?: string | undefined;
    weightage?: number | undefined;
    progress?: number | undefined;
    responsibleProcess?: string | undefined;
    complianceDate?: string | undefined;
    realizedActivities?: string | undefined;
}>;
export declare const updateProjectSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    weightage: z.ZodOptional<z.ZodNumber>;
    strategy: z.ZodOptional<z.ZodString>;
    detail: z.ZodOptional<z.ZodString>;
    activities: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        weightage: z.ZodNumber;
        progress: z.ZodNumber;
        responsibleProcess: z.ZodString;
        complianceDate: z.ZodString;
        realizedActivities: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        weightage: number;
        progress: number;
        responsibleProcess: string;
        complianceDate: string;
        realizedActivities: string;
    }, {
        id: string;
        name: string;
        weightage: number;
        progress: number;
        responsibleProcess: string;
        complianceDate: string;
        realizedActivities: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name?: string | undefined;
    weightage?: number | undefined;
    strategy?: string | undefined;
    detail?: string | undefined;
    activities?: {
        id: string;
        name: string;
        weightage: number;
        progress: number;
        responsibleProcess: string;
        complianceDate: string;
        realizedActivities: string;
    }[] | undefined;
}, {
    id: string;
    name?: string | undefined;
    weightage?: number | undefined;
    strategy?: string | undefined;
    detail?: string | undefined;
    activities?: {
        id: string;
        name: string;
        weightage: number;
        progress: number;
        responsibleProcess: string;
        complianceDate: string;
        realizedActivities: string;
    }[] | undefined;
}>;
export declare const updatePerspectiveSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    weightage: z.ZodOptional<z.ZodNumber>;
    objective: z.ZodOptional<z.ZodString>;
    projects: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        weightage: z.ZodNumber;
        strategy: z.ZodString;
        detail: z.ZodString;
        activities: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            weightage: z.ZodNumber;
            progress: z.ZodNumber;
            responsibleProcess: z.ZodString;
            complianceDate: z.ZodString;
            realizedActivities: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            weightage: number;
            progress: number;
            responsibleProcess: string;
            complianceDate: string;
            realizedActivities: string;
        }, {
            id: string;
            name: string;
            weightage: number;
            progress: number;
            responsibleProcess: string;
            complianceDate: string;
            realizedActivities: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        weightage: number;
        strategy: string;
        detail: string;
        activities: {
            id: string;
            name: string;
            weightage: number;
            progress: number;
            responsibleProcess: string;
            complianceDate: string;
            realizedActivities: string;
        }[];
    }, {
        id: string;
        name: string;
        weightage: number;
        strategy: string;
        detail: string;
        activities: {
            id: string;
            name: string;
            weightage: number;
            progress: number;
            responsibleProcess: string;
            complianceDate: string;
            realizedActivities: string;
        }[];
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name?: string | undefined;
    weightage?: number | undefined;
    objective?: string | undefined;
    projects?: {
        id: string;
        name: string;
        weightage: number;
        strategy: string;
        detail: string;
        activities: {
            id: string;
            name: string;
            weightage: number;
            progress: number;
            responsibleProcess: string;
            complianceDate: string;
            realizedActivities: string;
        }[];
    }[] | undefined;
}, {
    id: string;
    name?: string | undefined;
    weightage?: number | undefined;
    objective?: string | undefined;
    projects?: {
        id: string;
        name: string;
        weightage: number;
        strategy: string;
        detail: string;
        activities: {
            id: string;
            name: string;
            weightage: number;
            progress: number;
            responsibleProcess: string;
            complianceDate: string;
            realizedActivities: string;
        }[];
    }[] | undefined;
}>;
export declare const progressUpdateSchema: z.ZodObject<{
    progress: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    progress: number;
}, {
    progress: number;
}>;
export declare const batchProgressUpdateSchema: z.ZodObject<{
    updates: z.ZodArray<z.ZodObject<{
        activityId: z.ZodString;
        progress: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        progress: number;
        activityId: string;
    }, {
        progress: number;
        activityId: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    updates: {
        progress: number;
        activityId: string;
    }[];
}, {
    updates: {
        progress: number;
        activityId: string;
    }[];
}>;
export declare const loginSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export type CreateActivity = z.infer<typeof createActivitySchema>;
export type CreateProject = z.infer<typeof createProjectSchema>;
export type CreatePerspective = z.infer<typeof createPerspectiveSchema>;
export type ProgressUpdate = z.infer<typeof progressUpdateSchema>;
export type BatchProgressUpdate = z.infer<typeof batchProgressUpdateSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
