import { useCallback, useEffect, useState } from 'react';

import { listEmployees } from '../../../shared/api/employees.api.js';
import { listPerformancePeriods } from '../../../shared/api/performance.api.js';
import {
  createAdminAdjustment,
  grantPerformancePeriodBonuses
} from '../../../shared/api/wallet.api.js';

export function useAdminWalletController(currentUser) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [employees, setEmployees] = useState([]);
  const [periods, setPeriods] = useState([]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [employeeList, periodList] = await Promise.all([
        listEmployees({ role: 'employee', isActive: 'true' }),
        listPerformancePeriods()
      ]);
      setEmployees(employeeList);
      setPeriods(periodList);
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible cargar datos de billetera.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const submitAdjustment = async ({ employeeId, points, reason }) => {
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await createAdminAdjustment({
        employeeId,
        points: Number(points),
        reason,
        createdBy: currentUser?.id ?? null
      });
      setSuccessMessage('Ajuste de puntos registrado correctamente.');
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible registrar el ajuste.');
    } finally {
      setSubmitting(false);
    }
  };

  const grantPeriodBonuses = async (periodId) => {
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await grantPerformancePeriodBonuses(periodId, currentUser?.id ?? null);
      setSuccessMessage(
        `Bonos del periodo procesados: ${result.granted ?? 0} abonados, ${result.skipped ?? 0} omitidos.`
      );
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible abonar bonos del periodo.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    loading,
    submitting,
    error,
    successMessage,
    employees,
    periods,
    submitAdjustment,
    grantPeriodBonuses,
    reload
  };
}
