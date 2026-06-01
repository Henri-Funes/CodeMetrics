import { requestApi } from './backendClient.js';

export async function getEmployeeWallet(employeeId) {
  if (!employeeId) {
    throw new Error('employeeId es obligatorio para consultar billetera.');
  }

  const payload = await requestApi(
    {
      method: 'get',
      url: `/api/wallet/employees/${employeeId}`
    },
    'No fue posible cargar la billetera del empleado.'
  );

  return payload.data ?? null;
}

export async function listEmployeeWalletTransactions(employeeId, params = {}) {
  if (!employeeId) {
    throw new Error('employeeId es obligatorio para consultar transacciones.');
  }

  const payload = await requestApi(
    {
      method: 'get',
      url: `/api/wallet/employees/${employeeId}/transactions`,
      params
    },
    'No fue posible cargar transacciones de billetera.'
  );

  return payload.data ?? [];
}
