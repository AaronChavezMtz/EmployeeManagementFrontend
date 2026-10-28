import Modal from './Modal';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmar', danger = false, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <Modal onClose={onCancel}>
      <div className="w-full max-w-sm rounded-lg border border-outline bg-surface p-6 shadow-xl">
        <h3 className="font-display text-lg text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-foreground-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md px-4 py-2 text-sm text-foreground-muted transition hover:text-foreground"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              danger
                ? 'bg-danger-strong text-white hover:opacity-90'
                : 'bg-primary text-white hover:bg-primary-hover'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
