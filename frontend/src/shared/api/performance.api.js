import { requestApi } from './backendClient.js';

export async function listPerformancePeriods() {
  const payload = await requestApi(
    {
      method: 'get',
      url: '/api/performance/periods'
    },
    'No fue posible cargar periodos de desempeno.'
  );

  return payload.data ?? [];
}

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

export async function submitSelfEvaluation(data) {
  const payload = await requestApi(
    {
      method: 'post',
      url: '/api/performance/reviews/self-evaluations',
      data
    },
    'No fue posible enviar la autoevaluacion.'
  );

  return payload.data ?? null;
}

export async function updateSelfEvaluation(reviewId, data) {
  const payload = await requestApi(
    {
      method: 'patch',
      url: `/api/performance/reviews/${reviewId}/self-evaluation`,
      data
    },
    'No fue posible actualizar la autoevaluacion.'
  );

  return payload.data ?? null;
}

export async function listPendingSupervisorReviews(params = {}) {
  const payload = await requestApi(
    {
      method: 'get',
      url: '/api/performance/reviews/pending-supervisor',
      params
    },
    'No fue posible cargar evaluaciones pendientes de supervisor.'
  );

  return payload.data ?? [];
}

export async function submitSupervisorEvaluation(reviewId, data) {
  const payload = await requestApi(
    {
      method: 'patch',
      url: `/api/performance/reviews/${reviewId}/supervisor-evaluation`,
      data
    },
    'No fue posible guardar la evaluacion del supervisor.'
  );

  return payload.data ?? null;
}

export async function finalizePerformanceReview(reviewId) {
  const payload = await requestApi(
    {
      method: 'post',
      url: `/api/performance/reviews/${reviewId}/finalize`
    },
    'No fue posible finalizar la evaluacion.'
  );

  return payload.data ?? null;
}
