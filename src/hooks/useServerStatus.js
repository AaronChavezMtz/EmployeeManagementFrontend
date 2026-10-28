import { useCallback, useEffect, useRef, useState } from 'react';
import { HEALTH_URL } from '../api/client';

const SLOW_AFTER_MS = 1500;   // si /health no contesta en 1.5 s, la API está arrancando
const GIVE_UP_AFTER_MS = 120000;
const POLL_EVERY_MS = 5000;

// Despierta la API en cuanto se abre el login (el arranque en frío empieza mientras la persona
// escribe) e informa su estado: 'checking' → 'ready', o 'waking' → 'ready' | 'down'.
export default function useServerStatus() {
  const [status, setStatus] = useState('checking');
  const run = useRef(0);

  const check = useCallback(() => {
    const id = ++run.current;
    const started = Date.now();
    setStatus('checking');
    const slowTimer = setTimeout(() => { if (run.current === id) setStatus('waking'); }, SLOW_AFTER_MS);

    async function attempt() {
      try {
        const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(20000), cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (run.current === id) { clearTimeout(slowTimer); setStatus('ready'); }
      } catch {
        if (run.current !== id) return;
        if (Date.now() - started >= GIVE_UP_AFTER_MS) { clearTimeout(slowTimer); setStatus('down'); return; }
        setTimeout(() => { if (run.current === id) attempt(); }, POLL_EVERY_MS);
      }
    }
    attempt();
  }, []);

  useEffect(() => {
    check();
    return () => { run.current++; }; // deja de sondear al salir del login
  }, [check]);

  return { status, recheck: check };
}
