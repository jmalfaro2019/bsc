import { useState } from "react";
import { Modal } from "../ui/modal";
import Alert from "../common/Alert";
import { TextField } from "./fields";
import { useCreateUser, useUpdateUser } from "../../hooks/useUsers";
import { getApiErrorMessage } from "../../utils/apiError";
import type { Role, User } from "bsc-shared";

interface UserFormModalProps {
  user: User | null;
  onClose: () => void;
}

const selectClasses =
  "w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:focus:border-brand-400 transition-all";

export default function UserFormModal({ user, onClose }: UserFormModalProps) {
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const [username, setUsername] = useState(user?.username ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>((user?.role as Role) ?? "lector");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEditing = user !== null;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (!username.trim()) {
      setErrorMessage("Ingrese un nombre de usuario");
      return;
    }
    if (!isEditing && password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (isEditing && password.length > 0 && password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setErrorMessage(null);

    const onError = (error: unknown) =>
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No se pudo guardar el usuario. Verifique que el nombre no esté en uso.",
        ),
      );

    if (isEditing && user) {
      updateMutation.mutate(
        {
          id: user.id,
          user: {
            username: username.trim(),
            role,
            ...(password ? { password } : {}),
          },
        },
        { onSuccess: onClose, onError },
      );
    } else {
      createMutation.mutate(
        { username: username.trim(), password, role },
        { onSuccess: onClose, onError },
      );
    }
  };

  return (
    <Modal isOpen onClose={onClose} className="max-w-md m-4 p-6 md:p-8">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {isEditing
          ? "Modifique los datos del usuario"
          : "Complete los datos para crear un usuario"}
      </p>

      <div className="mt-6 space-y-4">
        <TextField
          label="Nombre de usuario"
          value={username}
          onChange={setUsername}
          placeholder="Ej: maria.gomez"
        />
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {isEditing ? "Contraseña (dejar en blanco para mantener)" : "Contraseña"}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEditing ? "••••••••" : "Mínimo 6 caracteres"}
            className="w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:focus:border-brand-400 transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Rol
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className={selectClasses}
          >
            <option value="lector">Lector (solo visualización)</option>
            <option value="admin">Administrador (acceso total)</option>
          </select>
        </div>

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
            {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear usuario"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
