// Traduce un error de axios a un mensaje entendible, distinguiendo el caso
// real que detectamos: "el backend no respondió" (API apagada, sin internet,
// CORS mal configurado) vs. "el backend respondió con un error" (401, 400, etc).
export function getErrorMessage(error, fallback = 'Ocurrió un error inesperado.') {
  // Sin response = la petición nunca llegó a buen puerto (red, servidor caído, CORS).
  if (!error?.response) {
    if (error?.code === 'ECONNABORTED') {
      return 'El servidor tardó demasiado en responder. Inténtalo de nuevo en unos momentos.';
    }
    return 'No se pudo conectar con el servidor. Verifica que la API esté en ejecución o tu conexión a internet.';
  }

  const { status, data } = error.response;

  if (status === 429) {
    return 'Demasiados intentos en poco tiempo. Espera un minuto antes de volver a intentarlo.';
  }
  if (status === 401) {
    return data?.message || 'No autorizado. Verifica tus credenciales.';
  }
  if (status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }
  if (status >= 500) {
    return 'El servidor tuvo un problema al procesar la solicitud. Inténtalo de nuevo en unos momentos.';
  }

  return data?.message || fallback;
}

// Convierte el diccionario de errores de validación de la API
// ({ Campo: ["mensaje"] }) a uno con las llaves en camelCase, como las usa React.
export function normalizeValidationErrors(validationErrors) {
  const normalized = {};
  Object.entries(validationErrors || {}).forEach(([key, messages]) => {
    normalized[key.charAt(0).toLowerCase() + key.slice(1)] = messages[0];
  });
  return normalized;
}
