import { useMutation } from "@tanstack/react-query";
import {
  createActivity,
  createPerspective,
  createProject,
  deleteActivity,
  deletePerspective,
  deleteProject,
  updateActivity,
  updatePerspective,
  updateProject,
} from "../services/bscService";
import { useInvalidatePerspectives } from "./usePerspectives";
import type {
  Activity,
  CreateActivity,
  CreatePerspective,
  CreateProject,
  Perspective,
  Project,
} from "bsc-shared";

export function useCreatePerspective() {
  const invalidate = useInvalidatePerspectives();
  return useMutation({
    mutationFn: (perspective: CreatePerspective) => createPerspective(perspective),
    onSuccess: invalidate,
  });
}

export function useUpdatePerspective() {
  const invalidate = useInvalidatePerspectives();
  return useMutation({
    mutationFn: ({
      id,
      perspective,
    }: {
      id: string;
      perspective: Partial<Omit<Perspective, "id" | "projects">>;
    }) => updatePerspective(id, perspective),
    onSuccess: invalidate,
  });
}

export function useDeletePerspective() {
  const invalidate = useInvalidatePerspectives();
  return useMutation({
    mutationFn: (id: string) => deletePerspective(id),
    onSuccess: invalidate,
  });
}

export function useCreateProject() {
  const invalidate = useInvalidatePerspectives();
  return useMutation({
    mutationFn: ({
      perspectiveId,
      project,
    }: {
      perspectiveId: string;
      project: CreateProject;
    }) => createProject(perspectiveId, project),
    onSuccess: invalidate,
  });
}

export function useUpdateProject() {
  const invalidate = useInvalidatePerspectives();
  return useMutation({
    mutationFn: ({
      perspectiveId,
      projectId,
      project,
    }: {
      perspectiveId: string;
      projectId: string;
      project: Partial<Omit<Project, "id" | "activities">>;
    }) => updateProject(perspectiveId, projectId, project),
    onSuccess: invalidate,
  });
}

export function useDeleteProject() {
  const invalidate = useInvalidatePerspectives();
  return useMutation({
    mutationFn: ({
      perspectiveId,
      projectId,
    }: {
      perspectiveId: string;
      projectId: string;
    }) => deleteProject(perspectiveId, projectId),
    onSuccess: invalidate,
  });
}

export function useCreateActivity() {
  const invalidate = useInvalidatePerspectives();
  return useMutation({
    mutationFn: ({
      perspectiveId,
      projectId,
      activity,
    }: {
      perspectiveId: string;
      projectId: string;
      activity: CreateActivity;
    }) => createActivity(perspectiveId, projectId, activity),
    onSuccess: invalidate,
  });
}

export function useUpdateActivity() {
  const invalidate = useInvalidatePerspectives();
  return useMutation({
    mutationFn: ({
      perspectiveId,
      projectId,
      activityId,
      activity,
    }: {
      perspectiveId: string;
      projectId: string;
      activityId: string;
      activity: Partial<Omit<Activity, "id">>;
    }) => updateActivity(perspectiveId, projectId, activityId, activity),
    onSuccess: invalidate,
  });
}

export function useDeleteActivity() {
  const invalidate = useInvalidatePerspectives();
  return useMutation({
    mutationFn: ({
      perspectiveId,
      projectId,
      activityId,
    }: {
      perspectiveId: string;
      projectId: string;
      activityId: string;
    }) => deleteActivity(perspectiveId, projectId, activityId),
    onSuccess: invalidate,
  });
}
