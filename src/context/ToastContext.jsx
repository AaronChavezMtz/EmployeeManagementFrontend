import { createContext, useContext, useCallback, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const styles = {
  success: { icon: CheckCircle2, classes: 'border-sage-500/30 bg-sage-500/10 text-sage-600' },
  error: { icon: XCircle, classes: 'border-clay-500/30 bg-clay-500/10 text-clay-600' },
  info: { icon: Info, classes: 'border-gold-500/30 bg-gold-500/10 text-gold-600' },
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
      <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
        {toasts.map(({ id, message, type }) => {
          const { icon: Icon, classes } = styles[type] ?? styles.info;
          return (
            <div
              key={id}
              className={`flex items-start gap-2.5 rounded-lg border bg-white px-4 py-3 text-sm shadow-lg shadow-black/10 ${classes}`}
            >
              <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
              <p className="flex-1 text-paper-100">{message}</p>
              <button onClick={() => dismiss(id)} className="text-paper-100/30 transition hover:text-paper-100/60">
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
