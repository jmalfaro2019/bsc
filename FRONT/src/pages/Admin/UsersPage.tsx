import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import QueryState from "../../components/common/QueryState";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import UserFormModal from "../../components/admin/UserFormModal";
import { PencilIcon, PlusIcon, TrashBinIcon } from "../../icons";
import { useUsers, useDeleteUser } from "../../hooks/useUsers";
import { useAuth } from "../../context/AuthContext";
import type { User } from "bsc-shared";

interface ConfirmState {
  user: User;
}

function formatDate(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function RoleBadge({ role }: { role: string }) {
  if (role === "admin") {
    return (
      <span className="inline-flex items-center rounded-md bg-brand-500/10 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300">
        Administrador
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-gray-500/10 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
      Lector
    </span>
  );
}

export default function UsersPage() {
  const { data, isLoading, error } = useUsers();
  const deleteUser = useDeleteUser();
  const { user: currentUser } = useAuth();

  const [modal, setModal] = useState<{ user: User | null } | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  return (
    <>
      <PageMeta
        title="Usuarios | Balanced Scorecard"
        description="Administración de usuarios y roles"
      />

      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Usuarios
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gestione el acceso y los roles del sistema
            </p>
          </div>
          <button
            onClick={() => setModal({ user: null })}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:scale-[0.98] transition-all duration-200"
          >
            <PlusIcon className="w-4 h-4" />
            Nuevo Usuario
          </button>
        </div>

        <QueryState isLoading={isLoading} isError={Boolean(error) || !data}>
          {data && (
            <div className="max-w-3xl">
              <div className="overflow-x-auto rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-900">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      <th className="text-left px-5 py-3">Usuario</th>
                      <th className="text-left px-5 py-3">Rol</th>
                      <th className="text-left px-5 py-3">Creado</th>
                      <th className="text-right px-5 py-3 w-28">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                    {data.map((user) => {
                      const isSelf = user.username === currentUser?.username;
                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-gray-200">
                            {user.username}
                            {isSelf && (
                              <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                                (usted)
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <RoleBadge role={user.role} />
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 text-xs">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-0.5">
                              <button
                                onClick={() => setModal({ user })}
                                className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title="Editar usuario"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setActionError(null);
                                  setConfirm({ user });
                                }}
                                disabled={isSelf}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isSelf
                                    ? "text-gray-200 dark:text-gray-700 cursor-not-allowed"
                                    : "text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                }`}
                                title={isSelf ? "No puede eliminarse a sí mismo" : "Eliminar usuario"}
                              >
                                <TrashBinIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {actionError && (
                <p className="mt-3 text-sm text-red-500 dark:text-red-400">
                  {actionError}
                </p>
              )}
            </div>
          )}
        </QueryState>

        {modal && (
          <UserFormModal user={modal.user} onClose={() => setModal(null)} />
        )}
        {confirm && (
          <ConfirmDialog
            isOpen
            title="Eliminar usuario"
            message={`¿Está seguro de eliminar al usuario "${confirm.user.username}"?`}
            isPending={deleteUser.isPending}
            onConfirm={() =>
              deleteUser.mutate(confirm.user.id, {
                onSuccess: () => setConfirm(null),
                onError: () =>
                  setActionError(
                    "No se pudo eliminar el usuario. Verifique que no sea el último administrador.",
                  ),
              })
            }
            onClose={() => setConfirm(null)}
          />
        )}
      </div>
    </>
  );
}
