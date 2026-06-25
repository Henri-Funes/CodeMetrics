import { requestApi } from './backendClient.js';

export async function createRedemption(payload) {
  const result = await requestApi(
    {
      method: 'post',
      url: '/api/redemptions',
      data: payload
    },
    'No fue posible solicitar el canje.'
  );

  return result.data ?? null;
}

export async function listRedemptions(params = {}) {
  const result = await requestApi(
    {
      method: 'get',
      url: '/api/redemptions',
      params
    },
    'No fue posible cargar canjes.'
  );

  return result.data ?? [];
}

export async function listEmployeeRedemptions(employeeId, params = {}) {
  const result = await requestApi(
    {
      method: 'get',
      url: `/api/redemptions/employees/${employeeId}`,
      params
    },
    'No fue posible cargar los canjes del empleado.'
  );

  return result.data ?? [];
}

export async function getRedemptionSummary() {
  const result = await requestApi(
    {
      method: 'get',
      url: '/api/redemptions/summary'
    },
    'No fue posible cargar el resumen de canjes.'
  );

  return result.data ?? {};
}

export async function approveRedemption(redemptionId, payload) {
  const result = await requestApi(
    {
      method: 'patch',
      url: `/api/redemptions/${redemptionId}/approve`,
      data: payload
    },
    'No fue posible aprobar el canje.'
  );

  return result.data ?? null;
}

export async function rejectRedemption(redemptionId, payload) {
  const result = await requestApi(
    {
      method: 'patch',
      url: `/api/redemptions/${redemptionId}/reject`,
      data: payload
    },
    'No fue posible rechazar el canje.'
  );

  return result.data ?? null;
}

export async function deliverRedemption(redemptionId, payload) {
  const result = await requestApi(
    {
      method: 'patch',
      url: `/api/redemptions/${redemptionId}/deliver`,
      data: payload
    },
    'No fue posible marcar la entrega del canje.'
  );

  return result.data ?? null;
}
