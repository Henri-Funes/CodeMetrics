import { useCallback, useEffect, useMemo, useState } from 'react';

import { listEmployees } from '../../../shared/api/employees.api.js';
import {
  cancelGoal,
  createGoal,
  ensureDemoGoals,
  listGoals,
  updateGoal,
  updateGoalProgress
} from '../../../shared/api/goals.api.js';
import { listPerformancePeriods } from '../../../shared/api/performance.api.js';
import { filterGoalsClient, summarizeGoals, toGoalRows } from '../models/goals.model.js';

export function useAdminGoalsController(currentUser) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [goals, setGoals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [filters, setFilters] = useState({
    employeeId: undefined,
    periodId: undefined,
    status: undefined,
    category: undefined,
    search: ''
  });

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [employeeList, periodList] = await Promise.all([
        listEmployees({ role: 'employee', isActive: 'true' }),
        listPerformancePeriods()
      ]);
      await ensureDemoGoals(employeeList, periodList, currentUser?.id ?? null);
      const goalList = await listGoals();

      setEmployees(employeeList);
      setPeriods(periodList);
      setGoals(goalList);
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible cargar la planificacion de objetivos.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const goalRows = useMemo(() => toGoalRows(goals, { employees, periods }), [goals, employees, periods]);
  const filteredGoals = useMemo(() => filterGoalsClient(goalRows, filters), [goalRows, filters]);
  const summary = useMemo(() => summarizeGoals(goalRows), [goalRows]);

  const saveGoal = async (payload, editingId = null) => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const period = periods.find((item) => item._id === payload.periodId);
      const nextPayload = {
        ...payload,
        assignedBy: currentUser?.id ?? null,
        periodLabel: period?.label ?? ''
      };

      if (editingId) {
        await updateGoal(editingId, nextPayload);
        setSuccessMessage('Objetivo actualizado correctamente.');
      } else {
        await createGoal(nextPayload);
        setSuccessMessage('Objetivo asignado correctamente.');
      }

      await reload();
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible guardar el objetivo.');
    } finally {
      setSaving(false);
    }
  };

  const submitProgress = async (goalId, payload) => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      await updateGoalProgress(goalId, payload);
      setSuccessMessage('Avance del objetivo actualizado.');
      await reload();
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible actualizar el avance.');
    } finally {
      setSaving(false);
    }
  };

  const cancelGoalById = async (goalId) => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      await cancelGoal(goalId);
      setSuccessMessage('Objetivo cancelado correctamente.');
      await reload();
    } catch (requestError) {
      setError(requestError.message ?? 'No fue posible cancelar el objetivo.');
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    error,
    successMessage,
    employees,
    periods,
    goals: goalRows,
    filteredGoals,
    filters,
    setFilters,
    summary,
    saveGoal,
    submitProgress,
    cancelGoal: cancelGoalById,
    reload
  };
}
