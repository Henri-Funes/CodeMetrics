import { useCallback, useEffect, useMemo, useState } from 'react';

import { listEmployees } from '../../../shared/api/employees.api.js';
import {
  assignSelfEvaluationPeriods,
  finalizePerformanceReview,
  listPerformancePeriods,
  listPerformanceReviews,
  submitSupervisorEvaluation
} from '../../../shared/api/performance.api.js';
import {
  filterEvaluationsClient,
  filterOpenPerformancePeriods,
  formatAssignPeriodsSummary,
  sortPerformancePeriods,
  summarizeEvaluations,
  toEvaluationRows
} from '../models/evaluations.model.js';
import { readEvaluationFilters, writeEvaluationFilters } from '../../../shared/utils/sessionPersistence.js';

const DEFAULT_FILTERS = {
  status: undefined,
  periodId: undefined,
  employeeId: undefined,
  search: ''
};

export function useAdminEvaluationsController(currentUser) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [filters, setFiltersState] = useState(() => ({
    ...DEFAULT_FILTERS,
    ...(readEvaluationFilters() ?? {})
  }));

  const setFilters = useCallback((updater) => {
    setFiltersState((previous) => {
      const next = typeof updater === 'function' ? updater(previous) : updater;
      writeEvaluationFilters(next);
      return next;
    });
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [reviewList, employeeList, periodList] = await Promise.all([
        listPerformanceReviews(),
        listEmployees({ role: 'employee', isActive: 'true' }),
        listPerformancePeriods()
      ]);

      setReviews(reviewList);
      setEmployees(employeeList);
      setPeriods(sortPerformancePeriods(periodList));
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible cargar evaluaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const evaluationRows = useMemo(() => toEvaluationRows(reviews), [reviews]);
  const filteredReviews = useMemo(
    () => filterEvaluationsClient(evaluationRows, filters),
    [evaluationRows, filters]
  );
  const summary = useMemo(() => summarizeEvaluations(evaluationRows), [evaluationRows]);
  const openPeriods = useMemo(() => filterOpenPerformancePeriods(periods), [periods]);

  const assignPeriods = async (periodInputs) => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await assignSelfEvaluationPeriods(periodInputs);
      setSuccessMessage(formatAssignPeriodsSummary(result));
      await reload();
      return result;
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible asignar autoevaluaciones.');
      throw requestError;
    } finally {
      setSaving(false);
    }
  };

  const saveSupervisorEvaluation = async (reviewId, values) => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      await submitSupervisorEvaluation(reviewId, {
        ...values,
        reviewedBy: currentUser?.id ?? null
      });
      setSuccessMessage('Evaluacion del supervisor guardada.');
      await reload();
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible guardar la evaluacion del supervisor.');
    } finally {
      setSaving(false);
    }
  };

  const finalizeReview = async (reviewId) => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      await finalizePerformanceReview(reviewId);
      setSuccessMessage('Evaluacion finalizada correctamente.');
      await reload();
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible finalizar la evaluacion.');
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    error,
    successMessage,
    reviews: evaluationRows,
    filteredReviews,
    employees,
    periods,
    openPeriods,
    filters,
    setFilters,
    summary,
    assignPeriods,
    saveSupervisorEvaluation,
    finalizeReview,
    reload
  };
}
