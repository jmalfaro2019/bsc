import { useEffect, useMemo, useState } from "react";
import { BoxCubeIcon, ChevronDownIcon } from "../../icons";
import { useCreateAvance } from "../../hooks/useCreateAvance";
import { getPerspectiveColors } from "../../utils/perspectiveColors";
import Alert from "../common/Alert";
import type { Perspective } from "bsc-shared";

interface ManualEntryCardProps {
  perspectives: Perspective[];
}

const selectClasses =
  "w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:focus:border-brand-400 transition-all";

export default function ManualEntryCard({ perspectives }: ManualEntryCardProps) {
  const createAvance = useCreateAvance();

  const [selectedPerspective, setSelectedPerspective] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [progressValue, setProgressValue] = useState(0);
  const [description, setDescription] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const projectOptions = useMemo(
    () => perspectives.find((p) => p.id === selectedPerspective)?.projects ?? [],
    [perspectives, selectedPerspective],
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

  const activePerspective = perspectives.find((p) => p.id === selectedPerspective);
  const pColors = activePerspective ? getPerspectiveColors(selectedPerspective) : null;

  return (
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
                {perspectives.map((p) => (
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
                step="0.1"
                value={progressValue}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (isNaN(val)) setProgressValue(0);
                  else setProgressValue(Math.min(100, Math.max(0, Math.round(val * 10) / 10)));
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
            <Alert variant="warning" align="start">
              <p>Complete los campos obligatorios:</p>
              <ul className="mt-1 list-disc list-inside">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </Alert>
          )}

          {createAvance.isError && (
            <Alert variant="error">
              Error al guardar los datos. Intente nuevamente.
            </Alert>
          )}

          {showSuccess && (
            <Alert variant="success">Datos actualizados exitosamente</Alert>
          )}
        </div>
      </div>
    </div>
  );
}
