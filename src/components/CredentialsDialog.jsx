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
      <div className="w-full max-w-sm rounded-lg border border-ink-700 bg-ink-900 p-6 shadow-xl">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-500/15">
          <KeyRound className="h-5 w-5 text-sage-600" strokeWidth={1.75} />
        </span>
        <h3 className="mt-3 font-display text-lg text-paper-100">Acceso al portal creado</h3>
        <p className="mt-1 text-sm text-paper-100/70">
          Entrégale estos datos a {employeeName}. Deberá cambiar la contraseña al entrar por primera vez.
        </p>

        <dl className="mt-4 space-y-2 rounded-md bg-ink-800 p-4 font-mono text-sm">
          <div>
            <dt className="text-xs font-sans text-paper-100/70">Usuario</dt>
            <dd className="break-all text-paper-100">{access.username}</dd>
          </div>
          <div>
            <dt className="text-xs font-sans text-paper-100/70">Contraseña temporal</dt>
            <dd className="text-paper-100">{access.temporaryPassword}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-clay-600">Esta contraseña no se volverá a mostrar.</p>

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={copy} className="flex items-center gap-2 rounded-md border border-ink-600 px-4 py-2 text-sm text-paper-100/70 transition hover:border-gold-500">
            {copied ? <Check className="h-4 w-4 text-sage-600" strokeWidth={2} /> : <Copy className="h-4 w-4" strokeWidth={1.75} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
          <button onClick={onClose} className="rounded-md bg-gold-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-gold-400">
            Listo
          </button>
        </div>
      </div>
    </Modal>
  );
}
