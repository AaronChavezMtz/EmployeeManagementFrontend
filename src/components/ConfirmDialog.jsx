export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmar', danger = false, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-lg border border-ink-700 bg-ink-900 p-6 shadow-xl">
        <h3 className="font-display text-lg text-paper-100">{title}</h3>
        <p className="mt-2 text-sm text-paper-100/70">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md px-4 py-2 text-sm text-paper-100/70 transition hover:text-paper-100"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              danger
                ? 'bg-clay-500 text-paper-100 hover:bg-clay-600'
                : 'bg-gold-500 text-ink-950 hover:bg-gold-400'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
