import { useQuery } from "@tanstack/react-query";
import { fetchAvances } from "../services/bscService";

export function useAvances(snapshotId?: string | null) {
  return useQuery({
    queryKey: ["avances", snapshotId ?? "current"],
    queryFn: () => fetchAvances(snapshotId),
  });
}
