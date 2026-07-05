import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSnapshots, createSnapshot, deleteSnapshot, fetchProgressTrend } from "../services/bscService";

export function useSnapshots() {
  return useQuery({
    queryKey: ["snapshots"],
    queryFn: fetchSnapshots,
  });
}

export function useCreateSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (label?: string) => createSnapshot(label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snapshots"] });
      queryClient.invalidateQueries({ queryKey: ["progressTrend"] });
    },
  });
}

export function useDeleteSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSnapshot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snapshots"] });
      queryClient.invalidateQueries({ queryKey: ["progressTrend"] });
    },
  });
}

export function useProgressTrend() {
  return useQuery({
    queryKey: ["progressTrend"],
    queryFn: fetchProgressTrend,
  });
}