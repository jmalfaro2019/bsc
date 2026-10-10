import { useState } from "react";
import { Modal } from "../ui/modal";
import Alert from "../common/Alert";
import { NumberField, TextAreaField, TextField } from "./fields";
import { useCreateProject, useUpdateProject } from "../../hooks/useStructureCrud";
import { getApiErrorMessage } from "../../utils/apiError";
import type { Project } from "bsc-shared";

interface ProjectFormModalProps {
  perspectiveId: string;
  project: Project | null;
  onClose: () => void;
}

export default function ProjectFormModal({
  perspectiveId,
  project,
  onClose,
}: ProjectFormModalProps) {
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const [name, setName] = useState(project?.name ?? "");
  const [weightage, setWeightage] = useState(project?.weightage ?? 0);
  const [strategy, setStrategy] = useState(project?.strategy ?? "");
  const [detail, setDetail] = useState(project?.detail ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEditing = project !== null;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (!name.trim()) {
      setErrorMessage("Ingrese un nombre para el proyecto");
      return;
    }
    setErrorMessage(null);

    const payload = {
      name: name.trim(),
      weightage,
      strategy: strategy.trim(),
      detail: detail.trim(),
    };
    const onError = (error: unknown) =>
      setErrorMessage(getApiErrorMessage(error, "No se pudo guardar el proyecto"));

    if (isEditing && project) {
      updateMutation.mutate(
        { perspectiveId, projectId: project.id, project: payload },
        { onSuccess: onClose, onError },
      );
    } else {
      createMutation.mutate(
        { perspectiveId, project: payload },
        { onSuccess: onClose, onError },
      );
    }
  };

  return (
    <Modal isOpen onClose={onClose} className="max-w-lg m-4 p-6 md:p-8">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        {isEditing ? "Editar Proyecto" : "Nuevo Proyecto"}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {isEditing
          ? "Modifique los datos del proyecto"
          : "Complete los datos para crear un proyecto"}
      </p>

      <div className="mt-6 space-y-4">
        <TextField
          label="Nombre"
          value={name}
          onChange={setName}
          placeholder="Ej: Fortalecimiento comercial"
        />
        <NumberField
          label="Ponderación (%)"
          value={weightage}
          onChange={setWeightage}
          min={0}
          max={100}
          step={0.01}
        />
        <TextAreaField
          label="Estrategia"
          value={strategy}
          onChange={setStrategy}
          placeholder="Estrategia del proyecto"
          rows={2}
        />
        <TextAreaField
          label="Detalle"
          value={detail}
          onChange={setDetail}
          placeholder="Detalle adicional del proyecto"
          rows={2}
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
            {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear proyecto"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
