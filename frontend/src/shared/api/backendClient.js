import axios from 'axios';
import { toFriendlyApiErrorMessage } from '../utils/apiErrors.js';

function resolveApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL;

  if (configuredUrl !== undefined) {
    return configuredUrl;
  }

  return import.meta.env.PROD ? '' : 'http://localhost:3000';
}

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar headers genéricos si a futuro hay JWT
apiClient.interceptors.request.use((config) => {
  return config;
});

function normalizeApiError(error, fallbackMessage) {
  const rawMessage =
    error?.response?.data?.error?.message ??
    error?.message ??
    fallbackMessage;

  const message = toFriendlyApiErrorMessage(rawMessage, fallbackMessage);
  return new Error(message);
}

export async function requestApi(config, fallbackMessage = 'Error de comunicacion con la API.') {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, fallbackMessage);
  }
}

export async function getBackendHealth() {
  return requestApi(
    { method: 'get', url: '/api/health' },
    'No fue posible consultar el estado del backend.'
  );
}
