import axios from 'axios';
import { isTransient, wait } from './retry';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// /health vive fuera de /api.
export const HEALTH_URL = `${API_URL.replace(/\/api\/?$/, '')}/health`;

// Sin tiempo límite, una petición a la API dormida se quedaba esperando para siempre.
const client = axios.create({ baseURL: API_URL, timeout: 25000 });

// Adjunta el JWT guardado a cada petición saliente.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('emp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const GET_RETRIES = 2;

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Las lecturas (GET) se reintentan solas si la API está despertando. Las escrituras no:
    // repetir un POST podría duplicar una alta o una solicitud.
    if (config && config.method === 'get' && isTransient(error) && (config.__retries ?? 0) < GET_RETRIES) {
      config.__retries = (config.__retries ?? 0) + 1;
      await wait(2000 * config.__retries, config.signal);
      return client(config);
    }

    // Si el token expiró o es inválido, la API responde 401: limpiamos
    // la sesión guardada y mandamos de vuelta al login.
    if (error.response?.status === 401) {
      localStorage.removeItem('emp_token');
      localStorage.removeItem('emp_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
