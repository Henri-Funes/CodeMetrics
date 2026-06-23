import { useCallback, useEffect, useMemo, useState } from 'react';

import { ensureDemoGoals, listGoals, updateGoalProgress } from '../../../shared/api/goals.api.js';
import { listPerformancePeriods } from '../../../shared/api/performance.api.js';
import { summarizeGoals, toGoalRows } from '../models/goals.model.js';

function toEmployeeRecord(currentUser) {
  return {
    _id: currentUser?.id,
    name: currentUser?.name,
    role: currentUser?.role,
    department: currentUser?.department,
    position: currentUser?.position,
    isActive: true
  };
}

export function useEmployeeGoalsController(currentUser) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [goals, setGoals] = useState([]);
  const [periods, setPeriods] = useState([]);

  const reload = useCallback(async () => {
    if (!currentUser?.id || currentUser.role !== 'employee') {
      setGoals([]);
      setPeriods([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const periodList = await listPerformancePeriods();
      await ensureDemoGoals([toEmployeeRecord(currentUser)], periodList);
      const goalList = await listGoals({ employeeId: currentUser.id });

      setPeriods(periodList);
      setGoals(goalList);
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible cargar objetivos.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, currentUser?.role, currentUser?.name, currentUser?.department, currentUser?.position]);

  useEffect(() => {
    reload();
  }, [reload]);

  const goalRows = useMemo(
    () => toGoalRows(goals, { employees: [toEmployeeRecord(currentUser)], periods }),
    [goals, currentUser, periods]
  );

  const summary = useMemo(() => summarizeGoals(goalRows), [goalRows]);

  const submitProgress = async (goalId, payload) => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      await updateGoalProgress(goalId, payload);
      setSuccessMessage('Avance actualizado correctamente.');
      await reload();
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible actualizar el avance.');
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    error,
    successMessage,
    goals: goalRows,
    summary,
    submitProgress,
    reload
  };
}
