import { requestApi } from './backendClient.js';

export async function listEmployees(params = {}) {
  const payload = await requestApi(
    {
      method: 'get',
      url: '/api/employees',
      params
    },
    'No fue posible cargar empleados.'
  );

  return payload.data ?? [];
}

export async function getEmployeeSummary() {
  const payload = await requestApi(
    {
      method: 'get',
      url: '/api/employees/summary'
    },
    'No fue posible cargar el resumen de empleados.'
  );

  return payload.data ?? {
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    employees: 0,
    totalPointBalance: 0
  };
}
