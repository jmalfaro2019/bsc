import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import PageMeta from "../../components/common/PageMeta";
import { ChevronDownIcon, BoxCubeIcon } from "../../icons";
import { usePerspectives } from "../../hooks/usePerspectives";
import { useCreateAvance } from "../../hooks/useCreateAvance";
import { useCreateSnapshot } from "../../hooks/useSnapshots";
import { getPerspectiveColors } from "../../utils/perspectiveColors";
import type { Perspective } from "bsc-shared";

interface ImportRow {
  perspective: string;
  project: string;
  activity: string;
  progress: number;
  description?: string;
}

interface PreviewRow {
  perspective: string;
  project: string;
  activity: string;
  currentProgress: number;
  newProgress: number;
  activityId: string;
  description: string;
  error?: string;
}

function parseCSVLine(line: string): string[] {
  const cols: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        cols.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  cols.push(current);
  return cols.map((c) => c.trim());
}

function parseCSV(text: string): ImportRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
  const pIdx = header.indexOf("perspectiva");
  const prIdx = header.indexOf("proyecto");
  const aIdx = header.indexOf("actividad");
  const vIdx = header.indexOf("avance");
  const dIdx = header.indexOf("descripción") !== -1 ? header.indexOf("descripción") : header.indexOf("descripcion");
  if (pIdx === -1 || prIdx === -1 || aIdx === -1 || vIdx === -1) return [];
  const rows: ImportRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length <= Math.max(pIdx, prIdx, aIdx, vIdx)) continue;
    const progress = parseFloat(cols[vIdx]);
    if (isNaN(progress)) continue;
    rows.push({
      perspective: cols[pIdx],
      project: cols[prIdx],
      activity: cols[aIdx],
      progress: Math.min(100, Math.max(0, progress)),
      description: dIdx !== -1 && cols[dIdx] ? cols[dIdx] : undefined,
    });
  }
  return rows;
}

function findColumnValue(row: Record<string, unknown>, key: string): unknown {
  const lowerKey = key.toLowerCase();
  for (const [k, v] of Object.entries(row)) {
    if (k.toLowerCase().trim() === lowerKey) return v;
  }
  return undefined;
}

function parseExcel(buffer: ArrayBuffer): ImportRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  const rows: ImportRow[] = [];
  for (const row of jsonData) {
    const perspective = findColumnValue(row, "perspectiva");
    const project = findColumnValue(row, "proyecto");
    const activity = findColumnValue(row, "actividad");
    const progress = findColumnValue(row, "avance");
    const description = findColumnValue(row, "descripción") ?? findColumnValue(row, "descripcion");
    if (!perspective || !project || !activity || progress === undefined) continue;
    const progressNum = parseFloat(String(progress));
    if (isNaN(progressNum)) continue;
    rows.push({
      perspective: String(perspective),
      project: String(project),
      activity: String(activity),
      progress: Math.min(100, Math.max(0, progressNum)),
      description: description ? String(description) : undefined,
    });
  }
  return rows;
}

function matchImportRows(rows: ImportRow[], perspectives: Perspective[]): PreviewRow[] {
  const preview: PreviewRow[] = [];
  for (const row of rows) {
    const foundPerspective = perspectives.find(
      (p) => normalize(p.name) === normalize(row.perspective),
    );
    if (!foundPerspective) {
      preview.push({
        perspective: row.perspective,
        project: row.project,
        activity: row.activity,
        currentProgress: 0,
        newProgress: row.progress,
        activityId: "",
        description: row.description || "",
        error: `Perspectiva "${row.perspective}" no encontrada`,
      });
      continue;
    }
    const foundProject = foundPerspective.projects.find(
      (pr) => normalize(pr.name) === normalize(row.project),
    );
    if (!foundProject) {
      preview.push({
        perspective: row.perspective,
        project: row.project,
        activity: row.activity,
        currentProgress: 0,
        newProgress: row.progress,
        activityId: "",
        description: row.description || "",
        error: `Proyecto "${row.project}" no encontrado en "${foundPerspective.name}"`,
      });
      continue;
    }
    const foundActivity = foundProject.activities.find(
      (a) => normalize(a.name) === normalize(row.activity),
    );
    if (!foundActivity) {
      preview.push({
        perspective: row.perspective,
        project: row.project,
        activity: row.activity,
        currentProgress: 0,
        newProgress: row.progress,
        activityId: "",
        description: row.description || "",
        error: `Actividad "${row.activity}" no encontrada en "${foundProject.name}"`,
      });
      continue;
    }
    preview.push({
      perspective: foundPerspective.name,
      project: foundProject.name,
      activity: foundActivity.name,
      currentProgress: foundActivity.progress,
      newProgress: row.progress,
      activityId: foundActivity.id,
      description: row.description || "",
    });
  }
  return preview;
}

function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function DataEntryTab() {
  const { data, isLoading, error } = usePerspectives();
  const createAvance = useCreateAvance();
  const createSnapshotMutation = useCreateSnapshot();

  const [selectedPerspective, setSelectedPerspective] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [progressValue, setProgressValue] = useState(0);
  const [description, setDescription] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [snapshotLabel, setSnapshotLabel] = useState("");
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  const [importPreview, setImportPreview] = useState<PreviewRow[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const perspectiveOptions = useMemo(() => data?.perspectives ?? [], [data?.perspectives]);
  const projectOptions = useMemo(
    () => perspectiveOptions.find((p) => p.id === selectedPerspective)?.projects ?? [],
    [perspectiveOptions, selectedPerspective],
  );
  const activityOptions = useMemo(
    () => projectOptions.find((p) => p.id === selectedProject)?.activities ?? [],
    [projectOptions, selectedProject],
  );

  useEffect(() => {
    setSelectedProject("");
    setSelectedActivity("");
    setValidationErrors([]);
  }, [selectedPerspective]);

  useEffect(() => {
    setSelectedActivity("");
    setValidationErrors([]);
  }, [selectedProject]);

  useEffect(() => {
    if (selectedActivity) {
      const currentActivity = activityOptions.find((a) => a.id === selectedActivity);
      if (currentActivity) {
        setProgressValue(currentActivity.progress);
      }
    }
  }, [selectedActivity, activityOptions]);

  const handleUpdate = () => {
    const errors: string[] = [];
    if (!selectedPerspective) errors.push("Seleccione una perspectiva");
    if (!selectedProject) errors.push("Seleccione un proyecto");
    if (!selectedActivity) errors.push("Seleccione una actividad");
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    createAvance.mutate(
      [
        {
          activityId: selectedActivity,
          progress: progressValue,
          description: description.trim() || undefined,
        },
      ],
      {
        onSuccess: () => {
          setShowSuccess(true);
          setDescription("");
          setTimeout(() => setShowSuccess(false), 3000);
        },
      },
    );
  };

  const handleDownloadTemplate = useCallback(() => {
    if (!data) return;
    const rows = data.perspectives.flatMap((perspective) =>
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
  }, [data]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setImportError(null);
      setImportSuccess(false);
      const file = e.target.files?.[0];
      if (!file) return;

      const MAX_FILE_SIZE = 5 * 1024 * 1024;
      const SUPPORTED_EXTENSIONS = [".csv", ".xlsx", ".xls"];

      const ext = file.name.toLowerCase();
      const isSupported = SUPPORTED_EXTENSIONS.some((e) => ext.endsWith(e));
      if (!isSupported) {
        setImportError("El archivo debe ser formato CSV o Excel (.xlsx, .xls)");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setImportError("El archivo es demasiado grande (máximo 5 MB)");
        return;
      }

      const isExcel = ext.endsWith(".xlsx") || ext.endsWith(".xls");

      if (isExcel) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const buffer = evt.target?.result as ArrayBuffer;
          const parsed = parseExcel(buffer);
          if (parsed.length === 0) {
            setImportError(
              "No se pudieron leer filas del archivo. Asegúrese de que las columnas sean: perspectiva, proyecto, actividad, avance",
            );
            return;
          }
          const perspectives = data?.perspectives ?? [];
          setImportPreview(matchImportRows(parsed, perspectives));
        };
        reader.readAsArrayBuffer(file);
      } else {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const text = evt.target?.result as string;
          if (text.includes("\0")) {
            setImportError("El archivo parece ser binario. Por favor intente con un archivo CSV válido o Excel");
            return;
          }
          const parsed = parseCSV(text);
          if (parsed.length === 0) {
            setImportError(
              "No se pudieron leer filas del archivo. Asegúrese de que las columnas sean: perspectiva, proyecto, actividad, avance",
            );
            return;
          }
          const perspectives = data?.perspectives ?? [];
          setImportPreview(matchImportRows(parsed, perspectives));
        };
        reader.readAsText(file);
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [data],
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return <div className="p-8 text-center text-red-500">Error cargando datos</div>;
  }

  const activePerspective = data.perspectives.find((p) => p.id === selectedPerspective);
  const pColors = activePerspective ? getPerspectiveColors(selectedPerspective) : null;

  const selectClasses =
    "w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:focus:border-brand-400 transition-all";

  const hasImportErrors = importPreview ? importPreview.some((r) => r.error) : false;

  return (
    <>
      <PageMeta
        title="Ingreso de Datos | Balanced Scorecard"
        description="Formulario para actualizar el avance de actividades"
      />

      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Ingreso de Datos
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Actualice el progreso de las actividades del Balanced Scorecard
          </p>
        </div>

        <div className="max-w-2xl">
          <div className="rounded-xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-900">
            {pColors && <div className={`h-1.5 w-full ${pColors.bar}`} />}
            {!pColors && (
              <div className="h-1.5 w-full bg-gradient-to-r from-brand-500 via-blue-light-500 via-violet-500 to-warning-500" />
            )}

            <div className="p-6 md:p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Perspectiva
                </label>
                <div className="relative">
                  <select
                    value={selectedPerspective}
                    onChange={(e) => setSelectedPerspective(e.target.value)}
                    className={selectClasses}
                  >
                    <option value="">Seleccione una perspectiva...</option>
                    {perspectiveOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div
                className={`space-y-1.5 transition-all duration-300 ${
                  !selectedPerspective ? "opacity-40 pointer-events-none" : "opacity-100"
                }`}
              >
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Proyecto
                </label>
                <div className="relative">
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className={selectClasses}
                  >
                    <option value="">Seleccione un proyecto...</option>
                    {projectOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div
                className={`space-y-1.5 transition-all duration-300 ${
                  !selectedProject ? "opacity-40 pointer-events-none" : "opacity-100"
                }`}
              >
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actividad
                </label>
                <div className="relative">
                  <select
                    value={selectedActivity}
                    onChange={(e) => setSelectedActivity(e.target.value)}
                    className={selectClasses}
                  >
                    <option value="">Seleccione una actividad...</option>
                    {activityOptions.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div
                className={`space-y-3 pt-2 transition-all duration-300 ${
                  !selectedActivity ? "opacity-40 pointer-events-none" : "opacity-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Valor de Avance
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progressValue}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val)) setProgressValue(0);
                      else setProgressValue(Math.min(100, Math.max(0, val)));
                    }}
                    className={`w-20 text-center text-lg font-bold tabular-nums rounded-lg border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 ${
                      progressValue >= 80
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30"
                        : progressValue >= 50
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/30"
                          : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-300 dark:border-red-500/30"
                    }`}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressValue}
                  onChange={(e) => setProgressValue(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <div className="flex justify-between text-[11px] text-gray-400 uppercase font-bold tracking-widest px-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              <div
                className={`space-y-1.5 pt-2 transition-all duration-300 ${
                  !selectedActivity ? "opacity-40 pointer-events-none" : "opacity-100"
                }`}
              >
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Descripción (opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describa el avance realizado..."
                  rows={2}
                  className="w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:focus:border-brand-400 transition-all resize-none"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleUpdate}
                  disabled={!selectedPerspective || createAvance.isPending}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-white transition-all duration-200 ${
                    !selectedPerspective || createAvance.isPending
                      ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                      : "bg-brand-500 hover:bg-brand-600 active:scale-[0.98]"
                  }`}
                >
                  <BoxCubeIcon className="w-4 h-4" />
                  {createAvance.isPending ? "Guardando..." : "Actualizar Avance"}
                </button>
              </div>

              {validationErrors.length > 0 && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4 flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Complete los campos obligatorios:
                    </p>
                    <ul className="mt-1 list-disc list-inside text-sm text-amber-700 dark:text-amber-400">
                      {validationErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {createAvance.isError && (
                <div className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-4 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    Error al guardar los datos. Intente nuevamente.
                  </p>
                </div>
              )}

              {showSuccess && (
                <div className="animate-fade-in rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 p-4 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    Datos actualizados exitosamente
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

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

              {importError && (
                <div className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-4 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">{importError}</p>
                </div>
              )}

              {importSuccess && (
                <div className="animate-fade-in rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 p-4 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    Datos actualizados exitosamente
                  </p>
                </div>
              )}

              {createAvance.isError && (
                <div className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-4 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    Error al aplicar los cambios. Intente nuevamente.
                  </p>
                </div>
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
                <div className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-4 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    Error al guardar el corte. Intente nuevamente.
                  </p>
                </div>
              )}

              {snapshotSuccess && (
                <div className="animate-fade-in rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 p-4 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    Corte guardado exitosamente
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
