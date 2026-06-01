import { useCallback, useEffect, useState } from 'react';

import { getEmployeeSummary } from '../../../shared/api/employees.api.js';
import { getPerformanceSummary } from '../../../shared/api/performance.api.js';
import { getRedemptionSummary } from '../../../shared/api/redemptions.api.js';

export function useAdminDashboardController() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeSummary, setEmployeeSummary] = useState(null);
  const [performanceSummary, setPerformanceSummary] = useState(null);
  const [redemptionSummary, setRedemptionSummary] = useState(null);

  const reload = useCallback(() => {
    setLoading(true);
    setError('');

    return Promise.all([getEmployeeSummary(), getPerformanceSummary(), getRedemptionSummary()])
      .then(([employees, performance, redemptions]) => {
        setEmployeeSummary(employees);
        setPerformanceSummary(performance);
        setRedemptionSummary(redemptions);
      })
      .catch((requestError) => {
        setError(requestError.message ?? 'No fue posible cargar el dashboard administrativo.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    reload().catch(() => {});
  }, [reload]);

  return {
    loading,
    error,
    employeeSummary,
    performanceSummary,
    redemptionSummary,
    reload
  };
}
