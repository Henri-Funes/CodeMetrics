import { useCallback, useEffect, useMemo, useState } from 'react';

import { listPerformanceReviews } from '../../../shared/api/performance.api.js';
import { getEmployeeWallet } from '../../../shared/api/wallet.api.js';
import { KPI_PRESENTATION, getScoreStatus } from '../models/employeeDashboard.model.js';

export function useEmployeeDashboardController(currentUser) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [latestReview, setLatestReview] = useState(null);
  const [wallet, setWallet] = useState(null);

  const reload = useCallback(() => {
    if (!currentUser?.id || currentUser.role !== 'employee') {
      setLatestReview(null);
      setWallet(null);
      setLoading(false);
      return Promise.resolve();
    }

    setLoading(true);
    setError('');

    return Promise.all([
      listPerformanceReviews({ employeeId: currentUser.id }),
      getEmployeeWallet(currentUser.id)
    ])
      .then(([reviews, walletResponse]) => {
        const sortedReviews = [...reviews].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setLatestReview(sortedReviews[0] ?? null);
        setWallet(walletResponse);
      })
      .catch((requestError) => {
        setError(requestError.message ?? 'No fue posible cargar tu dashboard.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    reload().catch(() => {});
  }, [reload]);

  const kpiCards = useMemo(() => {
    if (!latestReview?.kpis) return [];

    return KPI_PRESENTATION.map((kpi) => ({
      ...kpi,
      value: Number(latestReview.kpis[kpi.key] ?? 0)
    }));
  }, [latestReview]);

  const scoreStatus = getScoreStatus(Number(latestReview?.finalScore ?? 0));

  return {
    loading,
    error,
    latestReview,
    wallet,
    kpiCards,
    scoreStatus,
    reload
  };
}
