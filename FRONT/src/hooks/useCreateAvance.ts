import { useMutation } from "@tanstack/react-query";
import { createAvance } from "../services/bscService";
import { useInvalidatePerspectives } from "./usePerspectives";

export function useCreateAvance() {
  const invalidatePerspectives = useInvalidatePerspectives();

  return useMutation({
    mutationFn: (items: { activityId: string; progress: number; description?: string }[]) =>
      createAvance(items),
    onSuccess: () => {
      invalidatePerspectives();
    },
  });
}
