import type { ReactNode } from "react";

interface QueryStateProps {
  isLoading: boolean;
  isError: boolean;
  children: ReactNode;
}

export default function QueryState({ isLoading, isError, children }: QueryStateProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500">Error cargando datos</div>;
  }

  return <>{children}</>;
}
