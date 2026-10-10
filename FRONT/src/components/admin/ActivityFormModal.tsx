import { useState } from "react";
import { Modal } from "../ui/modal";
import Alert from "../common/Alert";
import { NumberField, TextAreaField, TextField } from "./fields";
import { useCreateActivity, useUpdateActivity } from "../../hooks/useStructureCrud";
import { getApiErrorMessage } from "../../utils/apiError";
import type { Activity } from "bsc-shared";

interface ActivityFormModalProps {
  perspectiveId: string;
  projectId: string;
  activity: Activity | null;
  onClose: () => void;
}

export default function ActivityFormModal({
  perspectiveId,
  projectId,
  activity,
  onClose,
}: ActivityFormModalProps) {
  const createMutation = useCreateActivity();
  const updateMutation = useUpdateActivity();

  const [name, setName] = useState(activity?.name ?? "");
  const [weightage, setWeightage] = useState(activity?.weightage ?? 0);
  const [progress, setProgress] = useState(activity?.progress ?? 0);
  const [responsibleProcess, setResponsibleProcess] = useState(
    activity?.responsibleProcess ?? "",
  );
  const [complianceDate, setComplianceDate] = useState(activity?.complianceDate ?? "");
  const [realizedActivities, setRealizedActivities] = useState(
    activity?.realizedActivities ?? "",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEditing = activity !== null;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (!name.trim()) {
      setErrorMessage("Ingrese un nombre para la actividad");
      return;
    }
    setErrorMessage(null);

    const payload = {
      name: name.trim(),
      weightage,
      progress,
      responsibleProcess: responsibleProcess.trim(),
      complianceDate: complianceDate.trim(),
      realizedActivities: realizedActivities.trim(),
    };
    const onError = (error: unknown) =>
      setErrorMessage(getApiErrorMessage(error, "No se pudo guardar la actividad"));

    if (isEditing && activity) {
      updateMutation.mutate(
        { perspectiveId, projectId, activityId: activity.id, activity: payload },
        { onSuccess: onClose, onError },
      );
    } else {
      createMutation.mutate(
        { perspectiveId, projectId, activity: payload },
        { onSuccess: onClose, onError },
      );
    }
  };

  return (
    <Modal isOpen onClose={onClose} className="max-w-lg m-4 p-6 md:p-8">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        {isEditing ? "Editar Actividad" : "Nueva Actividad"}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {isEditing
          ? "Modifique los datos de la actividad"
          : "Complete los datos para crear una actividad"}
      </p>

      <div className="mt-6 space-y-4">
        <TextField
          label="Nombre"
          value={name}
          onChange={setName}
          placeholder="Ej: Capacitación del personal"
        />
        <div className="grid grid-cols-2 gap-4">
          <NumberField
            label="Ponderación (%)"
            value={weightage}
            onChange={setWeightage}
            min={0}
            max={100}
            step={0.01}
          />
          <NumberField
            label="Avance (%)"
            value={progress}
            onChange={setProgress}
            min={0}
            max={100}
            step={0.1}
          />
        </div>
        <TextField
          label="Responsable / Proceso"
          value={responsibleProcess}
          onChange={setResponsibleProcess}
          placeholder="Ej: Dirección Comercial"
        />
        <TextField
          label="Fecha de cumplimiento"
          value={complianceDate}
          onChange={setComplianceDate}
          placeholder="Ej: 2026-06-30"
        />
        <TextAreaField
          label="Actividades realizadas"
          value={realizedActivities}
          onChange={setRealizedActivities}
          placeholder="Descripción de las actividades realizadas"
          rows={3}
        />

        {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 ${
              isPending
                ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                : "bg-brand-500 hover:bg-brand-600 active:scale-[0.98]"
            }`}
          >
            {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear actividad"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
