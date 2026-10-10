import { useState } from "react";
import { Modal } from "../ui/modal";
import Alert from "../common/Alert";
import { NumberField, TextAreaField, TextField } from "./fields";
import {
  useCreatePerspective,
  useUpdatePerspective,
} from "../../hooks/useStructureCrud";
import { getApiErrorMessage } from "../../utils/apiError";
import type { Perspective } from "bsc-shared";

interface PerspectiveFormModalProps {
  perspective: Perspective | null;
  onClose: () => void;
}

export default function PerspectiveFormModal({
  perspective,
  onClose,
}: PerspectiveFormModalProps) {
  const createMutation = useCreatePerspective();
  const updateMutation = useUpdatePerspective();

  const [name, setName] = useState(perspective?.name ?? "");
  const [objective, setObjective] = useState(perspective?.objective ?? "");
  const [weightage, setWeightage] = useState(perspective?.weightage ?? 0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEditing = perspective !== null;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (!name.trim()) {
      setErrorMessage("Ingrese un nombre para la perspectiva");
      return;
    }
    setErrorMessage(null);

    const payload = { name: name.trim(), objective: objective.trim(), weightage };
    const onError = (error: unknown) =>
      setErrorMessage(
        getApiErrorMessage(error, "No se pudo guardar la perspectiva"),
      );

    if (isEditing && perspective) {
      updateMutation.mutate(
        { id: perspective.id, perspective: payload },
        { onSuccess: onClose, onError },
      );
    } else {
      createMutation.mutate(payload, { onSuccess: onClose, onError });
    }
  };

  return (
    <Modal isOpen onClose={onClose} className="max-w-lg m-4 p-6 md:p-8">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        {isEditing ? "Editar Perspectiva" : "Nueva Perspectiva"}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {isEditing
          ? "Modifique los datos de la perspectiva"
          : "Complete los datos para crear una perspectiva"}
      </p>

      <div className="mt-6 space-y-4">
        <TextField
          label="Nombre"
          value={name}
          onChange={setName}
          placeholder="Ej: Financiera"
        />
        <TextAreaField
          label="Objetivo"
          value={objective}
          onChange={setObjective}
          placeholder="Objetivo estratégico de la perspectiva"
          rows={3}
        />
        <NumberField
          label="Ponderación (%)"
          value={weightage}
          onChange={setWeightage}
          min={0}
          max={100}
          step={0.01}
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
            {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear perspectiva"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
