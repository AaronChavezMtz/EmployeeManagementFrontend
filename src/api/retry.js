// Reintentos con espera creciente para fallos transitorios. En el plan gratuito de Render la API
// se duerme y tarda 30–60 s en despertar: mientras tanto la petición se cae o devuelve 502/503/504.

// Transitorio = vale la pena reintentar: no hubo respuesta (red, tiempo agotado) o el proxy
// respondió que la API aún no está. Un 400/401/429 es definitivo: reintentar no lo cambia.
export function isTransient(error) {
  if (error?.code === 'ERR_CANCELED') return false;
  if (!error?.response) return true;
  return [502, 503, 504].includes(error.response.status);
}

export function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(Object.assign(new Error('Cancelado'), { code: 'ERR_CANCELED' }));
    }, { once: true });
  });
}

// Ejecuta fn(intento) hasta `attempts` veces: espera 2 s, 4 s, 8 s… (tope maxDelay) entre intentos.
// onRetry({ attempt, attempts, delay }) avisa a la interfaz antes de cada espera.
export async function withRetry(fn, { attempts = 5, baseDelay = 2000, maxDelay = 10000, signal, onRetry } = {}) {
  for (let i = 0; ; i++) {
    try {
      return await fn(i + 1);
    } catch (error) {
      if (signal?.aborted || !isTransient(error) || i + 1 >= attempts) throw error;
      const delay = Math.min(baseDelay * 2 ** i, maxDelay);
      onRetry?.({ attempt: i + 2, attempts, delay });
      await wait(delay, signal);
    }
  }
}
