import { createContext, useContext, useCallback, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const styles = {
  success: { icon: CheckCircle2, classes: 'border-success/30 bg-success/10 text-success-strong' },
  error: { icon: XCircle, classes: 'border-danger/30 bg-danger/10 text-danger-strong' },
  info: { icon: Info, classes: 'border-primary/30 bg-primary/10 text-primary-strong' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const dismiss = (id) => setToasts((t) => t.filter((toast) => toast.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div role="region" aria-label="Notificaciones" aria-live="polite" className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
        {toasts.map(({ id, message, type }) => {
          const { icon: Icon, classes } = styles[type] ?? styles.info;
          return (
            <div
              key={id}
              role={type === 'error' ? 'alert' : 'status'}
              className={`flex items-start gap-2.5 rounded-lg border bg-white px-4 py-3 text-sm shadow-lg shadow-black/10 ${classes}`}
            >
              <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
              <p className="flex-1 text-foreground">{message}</p>
              <button onClick={() => dismiss(id)} aria-label="Cerrar aviso" className="text-foreground-muted transition hover:text-foreground-muted">
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
