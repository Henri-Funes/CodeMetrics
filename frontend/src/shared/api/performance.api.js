import { requestApi } from './backendClient.js';

export async function listPerformanceReviews(params = {}) {
  const payload = await requestApi(
    {
      method: 'get',
      url: '/api/performance/reviews',
      params
    },
    'No fue posible cargar evaluaciones de desempeno.'
  );

  return payload.data ?? [];
}

export async function getPerformanceSummary(params = {}) {
  const payload = await requestApi(
    {
      method: 'get',
      url: '/api/performance/reviews/summary',
      params
    },
    'No fue posible cargar el resumen de desempeno.'
  );

  return payload.data ?? {};
}
