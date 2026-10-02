import api from "./api";
import type { BSCData, Perspective, Project, Activity, Snapshot, Avance, AvanceItem } from "../types/bsc";

const PERSPECTIVES_KEY = "/perspectives";
const SNAPSHOTS_KEY = "/snapshots";
const AVANCES_KEY = "/avances";

export async function fetchPerspectives(snapshotId?: string): Promise<BSCData> {
  const url = snapshotId
    ? `${PERSPECTIVES_KEY}?snapshotId=${snapshotId}`
    : PERSPECTIVES_KEY;
  const { data } = await api.get<Perspective[]>(url);
  return { perspectives: data };
}

export async function fetchPerspective(id: string): Promise<Perspective> {
  const { data } = await api.get<Perspective>(`${PERSPECTIVES_KEY}/${id}`);
  return data;
}

export async function updateActivityProgress(
  perspectiveId: string,
  projectId: string,
  activityId: string,
  progress: number,
): Promise<Activity> {
  const { data } = await api.patch<Activity>(
    `${PERSPECTIVES_KEY}/${perspectiveId}/projects/${projectId}/activities/${activityId}/progress`,
    { progress },
  );
  return data;
}

export async function createPerspective(
  perspective: Omit<Perspective, "id" | "projects">,
): Promise<Perspective> {
  const { data } = await api.post<Perspective>(PERSPECTIVES_KEY, perspective);
  return data;
}

export async function updatePerspective(
  id: string,
  perspective: Partial<Omit<Perspective, "id" | "projects">>,
): Promise<Perspective> {
  const { data } = await api.patch<Perspective>(
    `${PERSPECTIVES_KEY}/${id}`,
    perspective,
  );
  return data;
}

export async function deletePerspective(id: string): Promise<void> {
  await api.delete(`${PERSPECTIVES_KEY}/${id}`);
}

export async function createProject(
  perspectiveId: string,
  project: Omit<Project, "id" | "activities">,
): Promise<Project> {
  const { data } = await api.post<Project>(
    `${PERSPECTIVES_KEY}/${perspectiveId}/projects`,
    project,
  );
  return data;
}

export async function updateProject(
  perspectiveId: string,
  projectId: string,
  project: Partial<Omit<Project, "id" | "activities">>,
): Promise<Project> {
  const { data } = await api.patch<Project>(
    `${PERSPECTIVES_KEY}/${perspectiveId}/projects/${projectId}`,
    project,
  );
  return data;
}

export async function deleteProject(
  perspectiveId: string,
  projectId: string,
): Promise<void> {
  await api.delete(
    `${PERSPECTIVES_KEY}/${perspectiveId}/projects/${projectId}`,
  );
}

export async function createActivity(
  perspectiveId: string,
  projectId: string,
  activity: Omit<Activity, "id">,
): Promise<Activity> {
  const { data } = await api.post<Activity>(
    `${PERSPECTIVES_KEY}/${perspectiveId}/projects/${projectId}/activities`,
    activity,
  );
  return data;
}

export async function updateActivity(
  perspectiveId: string,
  projectId: string,
  activityId: string,
  activity: Partial<Omit<Activity, "id">>,
): Promise<Activity> {
  const { data } = await api.patch<Activity>(
    `${PERSPECTIVES_KEY}/${perspectiveId}/projects/${projectId}/activities/${activityId}`,
    activity,
  );
  return data;
}

export async function deleteActivity(
  perspectiveId: string,
  projectId: string,
  activityId: string,
): Promise<void> {
  await api.delete(
    `${PERSPECTIVES_KEY}/${perspectiveId}/projects/${projectId}/activities/${activityId}`,
  );
}

export async function batchUpdateProgress(
  updates: { activityId: string; progress: number }[],
): Promise<{ updated: Activity[] }> {
  const { data } = await api.patch(`${PERSPECTIVES_KEY}/batch-progress`, {
    updates,
  });
  return data;
}

export async function fetchSnapshots(): Promise<Snapshot[]> {
  const { data } = await api.get<Snapshot[]>(SNAPSHOTS_KEY);
  return data;
}

export async function createSnapshot(label?: string): Promise<Snapshot> {
  const { data } = await api.post<Snapshot>(SNAPSHOTS_KEY, { label });
  return data;
}

export async function deleteSnapshot(id: string): Promise<void> {
  await api.delete(`${SNAPSHOTS_KEY}/${id}`);
}

export interface ProgressTrendPoint {
  id: string;
  label: string | null;
  date: string;
  avgProgress: number;
}

export async function fetchProgressTrend(): Promise<ProgressTrendPoint[]> {
  const { data } = await api.get<ProgressTrendPoint[]>(`${SNAPSHOTS_KEY}/progress-trend`);
  return data;
}

export async function createAvance(
  items: { activityId: string; progress: number; description?: string }[],
): Promise<Avance> {
  const { data } = await api.post<Avance>(AVANCES_KEY, { items });
  return data;
}

export interface AvanceItemWithActivity extends AvanceItem {
  activity: { id: string; name: string } | null;
}

export interface AvanceWithItems extends Omit<Avance, "items"> {
  items: AvanceItemWithActivity[];
}

export async function fetchAvances(snapshotId?: string | null): Promise<AvanceWithItems[]> {
  const url = snapshotId
    ? `${AVANCES_KEY}?snapshotId=${snapshotId}`
    : `${AVANCES_KEY}?current=true`;
  const { data } = await api.get<AvanceWithItems[]>(url);
  return data;
}

export async function deleteAvance(id: string): Promise<void> {
  await api.delete(`${AVANCES_KEY}/${id}`);
}