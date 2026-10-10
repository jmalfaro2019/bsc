import { useCallback, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useCreateAvance } from "../../hooks/useCreateAvance";
import Alert from "../common/Alert";
import {
  IMPORT_COLUMNS_ERROR,
  matchImportRows,
  parseImportFile,
  validateImportFile,
  type PreviewRow,
} from "../../utils/importRows";
import type { Perspective } from "bsc-shared";

interface ImportCardProps {
  perspectives: Perspective[];
}

export default function ImportCard({ perspectives }: ImportCardProps) {
  const createAvance = useCreateAvance();

  const [importPreview, setImportPreview] = useState<PreviewRow[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = useCallback(() => {
    const rows = perspectives.flatMap((perspective) =>
      perspective.projects.flatMap((project) =>
        project.activities.map((activity) => ({
          perspectiva: perspective.name,
          proyecto: project.name,
          actividad: activity.name,
          avance: activity.progress,
          descripción: "",
        })),
      ),
    );
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BSC");
    XLSX.writeFile(wb, "plantilla_bsc.xlsx");
  }, [perspectives]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setImportError(null);
      setImportSuccess(false);
      const file = e.target.files?.[0];
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (!file) return;

      const validationError = validateImportFile(file);
      if (validationError) {
        setImportError(validationError);
        return;
      }

      try {
        const parsed = await parseImportFile(file);
        if (parsed.length === 0) {
          setImportError(IMPORT_COLUMNS_ERROR);
          return;
        }
        setImportPreview(matchImportRows(parsed, perspectives));
      } catch (err) {
        setImportError(err instanceof Error ? err.message : IMPORT_COLUMNS_ERROR);
      }
    },
    [perspectives],
  );

  const handleApplyBatch = () => {
    if (!importPreview) return;
    const validRows = importPreview.filter((r) => !r.error);
    if (validRows.length === 0) return;
    createAvance.mutate(
      validRows.map((r) => ({
        activityId: r.activityId,
        progress: r.newProgress,
        description: r.description.trim() || undefined,
      })),
      {
        onSuccess: () => {
          setImportSuccess(true);
          setImportPreview(null);
          setTimeout(() => setImportSuccess(false), 3000);
        },
      },
    );
  };

  const handleCancelImport = () => {
    setImportPreview(null);
    setImportError(null);
    setImportSuccess(false);
  };

  const handleDescriptionChange = (index: number, value: string) => {
    if (!importPreview) return;
    setImportPreview(
      importPreview.map((row, i) =>
        i === index ? { ...row, description: value } : row,
      ),
    );
  };

  const hasImportErrors = importPreview ? importPreview.some((r) => r.error) : false;

  return (
    <div className="max-w-4xl mt-8">
      <div className="rounded-xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-900">
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-500 via-blue-light-500 via-violet-500 to-warning-500" />
        <div className="p-6 md:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Actualización por archivo
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Descargue la plantilla, modifique los avances y súbala para actualizar múltiples actividades
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar plantilla Excel
            </button>
            <label className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold border border-brand-200 dark:border-brand-500/30 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Cargar archivo
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {importError && <Alert variant="error">{importError}</Alert>}

          {importSuccess && (
            <Alert variant="success">Datos actualizados exitosamente</Alert>
          )}

          {createAvance.isError && (
            <Alert variant="error">
              Error al aplicar los cambios. Intente nuevamente.
            </Alert>
          )}

          {importPreview && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                        Perspectiva
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                        Proyecto
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                        Actividad
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                        Avance actual
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                        Nuevo avance
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                        Descripción
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {importPreview.map((row, i) => (
                      <tr
                        key={i}
                        className={
                          row.error
                            ? "bg-red-50/50 dark:bg-red-500/5"
                            : "bg-white dark:bg-gray-900"
                        }
                      >
                        <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100">
                          {row.perspective}
                        </td>
                        <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100">
                          {row.project}
                        </td>
                        <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100">
                          {row.activity}
                        </td>
                        <td className="px-4 py-2.5 text-center tabular-nums text-gray-600 dark:text-gray-400">
                          {row.error ? "—" : `${row.currentProgress}%`}
                        </td>
                        <td
                          className={`px-4 py-2.5 text-center tabular-nums font-semibold ${
                            row.error
                              ? "text-gray-400"
                              : row.newProgress >= 80
                                ? "text-emerald-600 dark:text-emerald-400"
                                : row.newProgress >= 50
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {row.newProgress}%
                        </td>
                        <td className="px-4 py-2.5">
                          {row.error ? (
                            <input
                              type="text"
                              disabled
                              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-2 py-1 text-xs text-gray-400"
                            />
                          ) : (
                            <input
                              type="text"
                              value={row.description}
                              onChange={(e) => handleDescriptionChange(i, e.target.value)}
                              placeholder="Añadir descripción..."
                              className="w-full min-w-[160px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:focus:border-brand-400 transition-all"
                            />
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          {row.error ? (
                            <span className="text-xs font-medium text-red-600 dark:text-red-400">
                              {row.error}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              Válido
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleApplyBatch}
                  disabled={hasImportErrors || createAvance.isPending}
                  className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all duration-200 ${
                    hasImportErrors || createAvance.isPending
                      ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                      : "bg-brand-500 hover:bg-brand-600 active:scale-[0.98]"
                  }`}
                >
                  {createAvance.isPending ? "Aplicando..." : "Aplicar cambios"}
                </button>
                <button
                  onClick={handleCancelImport}
                  className="rounded-xl px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
