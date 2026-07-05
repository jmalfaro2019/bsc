import { useState } from "react";
import { ChevronDownIcon, CalenderIcon, TrashBinIcon } from "../../icons";
import { useSnapshots, useDeleteSnapshot } from "../../hooks/useSnapshots";

interface SnapshotSelectorProps {
  selectedSnapshotId: string | null;
  onSnapshotChange: (snapshotId: string | null) => void;
}

function formatDate(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function SnapshotSelector({
  selectedSnapshotId,
  onSnapshotChange,
}: SnapshotSelectorProps) {
  const { data: snapshots, isLoading } = useSnapshots();
  const deleteSnapshot = useDeleteSnapshot();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (isLoading || !snapshots) return null;

  const selectedSnapshot = snapshots.find((s) => s.id === selectedSnapshotId);

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      deleteSnapshot.mutate(id, {
        onSuccess: () => {
          if (selectedSnapshotId === id) {
            onSnapshotChange(null);
          }
          setConfirmDeleteId(null);
        },
      });
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setIsOpen(!isOpen); setConfirmDeleteId(null); }}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 border ${
          selectedSnapshotId
            ? "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-500/30 hover:bg-brand-100 dark:hover:bg-brand-500/20"
            : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        <CalenderIcon className="w-4 h-4" />
        {selectedSnapshot
          ? selectedSnapshot.label || formatDate(selectedSnapshot.date)
          : "Actual"}
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => { setIsOpen(false); setConfirmDeleteId(null); }}
          />
          <div className="absolute right-0 mt-2 z-20 w-72 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
            <div className="p-2 max-h-80 overflow-y-auto">
              <button
                onClick={() => {
                  onSnapshotChange(null);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  !selectedSnapshotId
                    ? "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <span className="font-semibold">Actual</span>
                <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Datos en tiempo real
                </span>
              </button>

              {snapshots.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
              )}

              {snapshots.map((snapshot) => (
                <div key={snapshot.id} className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      onSnapshotChange(snapshot.id);
                      setIsOpen(false);
                    }}
                    className={`flex-1 text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      selectedSnapshotId === snapshot.id
                        ? "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="font-medium">
                      {snapshot.label || formatDate(snapshot.date)}
                    </span>
                    <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {formatDate(snapshot.date)}
                    </span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(snapshot.id); }}
                    className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                      confirmDeleteId === snapshot.id
                        ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30"
                        : "text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    title={confirmDeleteId === snapshot.id ? "Confirmar eliminación" : "Eliminar corte"}
                  >
                    <TrashBinIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {snapshots.length === 0 && (
                <p className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 italic">
                  No hay cortes guardados
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}