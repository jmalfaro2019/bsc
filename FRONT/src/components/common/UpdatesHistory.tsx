"use client";

import { useMemo, useState } from "react";
import { ListIcon } from "../../icons";
import { useAvances } from "../../hooks/useAvances";
import type { Perspective } from "../../types/bsc";

interface UpdatesHistoryProps {
  perspectives: Perspective[];
  snapshotId: string | null;
}

interface UpdateRow {
  id: string;
  date: string | Date;
  activityName: string;
  projectName: string;
  perspectiveName: string;
  progress: number;
  description: string;
}

const PAGE_SIZE = 10;

function formatDate(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return d.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function progressBadge(progress: number): string {
  if (progress >= 80) {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  }
  if (progress >= 50) {
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  }
  return "bg-red-500/10 text-red-600 dark:text-red-400";
}

export default function UpdatesHistory({ perspectives, snapshotId }: UpdatesHistoryProps) {
  const { data: avances, isLoading, isError } = useAvances(snapshotId);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const rows = useMemo<UpdateRow[]>(() => {
    const lookup = new Map<
      string,
      { activityName: string; projectName: string; perspectiveName: string }
    >();
    for (const perspective of perspectives) {
      for (const project of perspective.projects) {
        for (const activity of project.activities) {
          lookup.set(activity.id, {
            activityName: activity.name,
            projectName: project.name,
            perspectiveName: perspective.name,
          });
        }
      }
    }

    return (avances ?? []).flatMap((avance) =>
      avance.items.map((item) => {
        const found = lookup.get(item.activityId);
        return {
          id: item.id,
          date: avance.date,
          activityName: found?.activityName ?? item.activity?.name ?? "Actividad no disponible",
          projectName: found?.projectName ?? "",
          perspectiveName: found?.perspectiveName ?? "",
          progress: item.progress,
          description: item.description ?? "",
        };
      }),
    );
  }, [avances, perspectives]);

  const visibleRows = rows.slice(0, visibleCount);
  const remaining = rows.length - visibleCount;

  return (
    <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-brand-500 to-blue-light-500" />

      <div className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <ListIcon className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Actualizaciones Recientes
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {snapshotId
                  ? "Detalle de las actualizaciones del corte seleccionado"
                  : "Detalle de las actualizaciones del período actual"}
              </p>
            </div>
          </div>
          {rows.length > 0 && (
            <span className="shrink-0 inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 tabular-nums">
              {rows.length} actualización{rows.length !== 1 ? "es" : ""}
            </span>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        )}

        {isError && (
          <div className="py-10 text-center">
            <p className="text-sm text-red-500 dark:text-red-400">
              Error cargando las actualizaciones
            </p>
          </div>
        )}

        {!isLoading && !isError && rows.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {snapshotId
                ? "No hay actualizaciones registradas en este corte"
                : "No hay actualizaciones en el período actual"}
            </p>
          </div>
        )}

        {!isLoading && !isError && rows.length > 0 && (
          <>
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {visibleRows.map((row) => (
                <li key={row.id} className="flex gap-4 py-3 first:pt-0">
                  <div className="w-24 shrink-0 pt-0.5">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {formatDate(row.date)}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
                      {formatTime(row.date)}
                    </p>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {row.activityName}
                        </p>
                        {(row.perspectiveName || row.projectName) && (
                          <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                            {row.perspectiveName}
                            {row.perspectiveName && row.projectName ? " · " : ""}
                            {row.projectName}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold tabular-nums ${progressBadge(row.progress)}`}
                      >
                        {row.progress}%
                      </span>
                    </div>
                    {row.description && (
                      <p className="mt-1 whitespace-pre-line text-sm text-gray-600 dark:text-gray-400">
                        {row.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {remaining > 0 && (
              <div className="mt-2 border-t border-gray-100 dark:border-gray-800 pt-4 text-center">
                <button
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Ver más ({remaining} restante{remaining !== 1 ? "s" : ""})
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
