import { Modal } from "../ui/modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Eliminar",
  isPending = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md m-4 p-6 md:p-8">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={isPending}
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 ${
            isPending
              ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 active:scale-[0.98]"
          }`}
        >
          {isPending ? "Eliminando..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
