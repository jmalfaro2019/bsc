import { useState } from "react";
import { useCreateSnapshot } from "../../hooks/useSnapshots";
import Alert from "../common/Alert";

export default function SnapshotCard() {
  const createSnapshotMutation = useCreateSnapshot();
  const [snapshotLabel, setSnapshotLabel] = useState("");
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  const handleCreateSnapshot = () => {
    const label = snapshotLabel.trim() || undefined;
    createSnapshotMutation.mutate(label, {
      onSuccess: () => {
        setSnapshotLabel("");
        setSnapshotSuccess(true);
        setTimeout(() => setSnapshotSuccess(false), 3000);
      },
    });
  };

  return (
    <div className="max-w-2xl mt-8">
      <div className="rounded-xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-900">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
        <div className="p-6 md:p-8 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Guardar Corte Mensual
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Guarde una captura del progreso actual como referencia histórica
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={snapshotLabel}
              onChange={(e) => setSnapshotLabel(e.target.value)}
              placeholder="Ej: Enero 2026, Q1 2026..."
              className="flex-1 appearance-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all"
            />
            <button
              onClick={handleCreateSnapshot}
              disabled={createSnapshotMutation.isPending}
              className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all duration-200 shrink-0 ${
                createSnapshotMutation.isPending
                  ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {createSnapshotMutation.isPending ? "Guardando..." : "Guardar corte"}
            </button>
          </div>

          {createSnapshotMutation.isError && (
            <Alert variant="error">
              Error al guardar el corte. Intente nuevamente.
            </Alert>
          )}

          {snapshotSuccess && (
            <Alert variant="success">Corte guardado exitosamente</Alert>
          )}
        </div>
      </div>
    </div>
  );
}
