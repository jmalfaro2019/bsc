import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAvance } from "../services/bscService";
import { useInvalidatePerspectives } from "./usePerspectives";

export function useCreateAvance() {
  const invalidatePerspectives = useInvalidatePerspectives();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: { activityId: string; progress: number; description?: string }[]) =>
      createAvance(items),
    onSuccess: () => {
      invalidatePerspectives();
      queryClient.invalidateQueries({ queryKey: ["avances"] });
    },
  });
}
