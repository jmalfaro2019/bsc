import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPerspectives } from "../services/bscService";
import type { BSCData } from "../types/bsc";

export function usePerspectives(snapshotId?: string) {
  return useQuery<BSCData>({
    queryKey: ["perspectives", snapshotId],
    queryFn: () => fetchPerspectives(snapshotId),
  });
}

export function useInvalidatePerspectives() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["perspectives"] });
  };
}