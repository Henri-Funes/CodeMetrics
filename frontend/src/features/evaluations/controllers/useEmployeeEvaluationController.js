import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  listPerformancePeriods,
  listPerformanceReviews,
  submitSelfEvaluation,
  updateSelfEvaluation
} from '../../../shared/api/performance.api.js';
import { EVALUATION_STATUS, toEvaluationRows } from '../models/evaluations.model.js';

export function useEmployeeEvaluationController(currentUser) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [periods, setPeriods] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);

  const reload = useCallback(async () => {
    if (!currentUser?.id || currentUser.role !== 'employee') {
      setPeriods([]);
      setReviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [periodList, reviewList] = await Promise.all([
        listPerformancePeriods(),
        listPerformanceReviews({ employeeId: currentUser.id })
      ]);

      setPeriods(periodList);
      setReviews(reviewList);
      setSelectedPeriodId((current) => current ?? periodList[0]?._id ?? null);
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible cargar evaluaciones.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    reload();
  }, [reload]);

  const evaluationRows = useMemo(() => toEvaluationRows(reviews), [reviews]);
  const selectedReview = useMemo(
    () => evaluationRows.find((review) => review.periodId?._id === selectedPeriodId) ?? null,
    [evaluationRows, selectedPeriodId]
  );
  const selectedPeriod = useMemo(
    () => periods.find((period) => period._id === selectedPeriodId) ?? null,
    [periods, selectedPeriodId]
  );

  const canEditSelfEvaluation =
    !selectedReview ||
    selectedReview.status === EVALUATION_STATUS.DRAFT ||
    selectedReview.status === EVALUATION_STATUS.SELF_SUBMITTED;

  const saveSelfEvaluation = async (values) => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      if (selectedReview?._id) {
        await updateSelfEvaluation(selectedReview._id, values);
      } else {
        await submitSelfEvaluation({
          ...values,
          employeeId: currentUser.id,
          periodId: selectedPeriodId
        });
      }

      setSuccessMessage('Autoevaluacion enviada correctamente.');
      await reload();
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible guardar la autoevaluacion.');
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    error,
    successMessage,
    periods,
    reviews: evaluationRows,
    selectedPeriod,
    selectedPeriodId,
    setSelectedPeriodId,
    selectedReview,
    canEditSelfEvaluation,
    saveSelfEvaluation,
    reload
  };
}
