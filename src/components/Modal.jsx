import { useEffect, useId, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Capa de diálogo accesible: role="dialog", foco atrapado, Esc para cerrar, foco devuelto al cerrar
// y sin scroll de fondo. El contenido (panel, título, botones) lo pone cada diálogo.
export default function Modal({ onClose, children }) {
  const ref = useRef(null);
  const fallbackId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const container = ref.current;
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // El primer título del panel nombra el diálogo para los lectores de pantalla.
    const heading = container.querySelector('h1, h2, h3');
    if (heading) {
      heading.id ||= fallbackId;
      container.setAttribute('aria-labelledby', heading.id);
    }

    // Foco inicial: el primer campo del formulario; si no hay, el primer botón (en una confirmación, "Cancelar").
    const first = container.querySelector('input:not([disabled]), select, textarea') ?? container.querySelector(FOCUSABLE);
    (first ?? container).focus();

    function handleKey(e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = [...container.querySelectorAll(FOCUSABLE)];
      if (items.length === 0) return;
      const [firstItem, lastItem] = [items[0], items[items.length - 1]];
      if (e.shiftKey && document.activeElement === firstItem) { e.preventDefault(); lastItem.focus(); }
      else if (!e.shiftKey && document.activeElement === lastItem) { e.preventDefault(); firstItem.focus(); }
    }
    container.addEventListener('keydown', handleKey);

    return () => {
      container.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [fallbackId]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm outline-none"
    >
      {children}
    </div>
  );
}
