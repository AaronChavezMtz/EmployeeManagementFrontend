import { useState } from 'react';
import Modal from './Modal';
import { Copy, Check, KeyRound } from 'lucide-react';

// Muestra una única vez las credenciales temporales del portal; la API no las vuelve a devolver.
export default function CredentialsDialog({ access, employeeName, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!access) return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(`Usuario: ${access.username}\nContraseña temporal: ${access.temporaryPassword}`);
      setCopied(true);
    } catch {
      setCopied(false); // sin permiso de portapapeles: se puede copiar a mano
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-sm rounded-lg border border-outline bg-surface p-6 shadow-xl">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15">
          <KeyRound className="h-5 w-5 text-success-strong" strokeWidth={1.75} />
        </span>
        <h3 className="mt-3 font-display text-lg text-foreground">Acceso al portal creado</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Entrégale estos datos a {employeeName}. Deberá cambiar la contraseña al entrar por primera vez.
        </p>

        <dl className="mt-4 space-y-2 rounded-md bg-muted p-4 font-mono text-sm">
          <div>
            <dt className="text-xs font-sans text-foreground-muted">Usuario</dt>
            <dd className="break-all text-foreground">{access.username}</dd>
          </div>
          <div>
            <dt className="text-xs font-sans text-foreground-muted">Contraseña temporal</dt>
            <dd className="text-foreground">{access.temporaryPassword}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-danger-strong">Esta contraseña no se volverá a mostrar.</p>

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={copy} className="flex items-center gap-2 rounded-md border border-outline px-4 py-2 text-sm text-foreground-muted transition hover:border-primary">
            {copied ? <Check className="h-4 w-4 text-success-strong" strokeWidth={2} /> : <Copy className="h-4 w-4" strokeWidth={1.75} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
          <button onClick={onClose} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover">
            Listo
          </button>
        </div>
      </div>
    </Modal>
  );
}
