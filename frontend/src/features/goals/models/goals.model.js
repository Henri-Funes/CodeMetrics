export const GOAL_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  AT_RISK: 'at_risk',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const GOAL_CATEGORIES = {
  CERTIFICATION: 'certification',
  TECHNICAL_DEBT: 'technical_debt',
  DELIVERY: 'delivery',
  QUALITY: 'quality',
  TRAINING: 'training',
  OTHER: 'other'
};

export const GOAL_UNITS = {
  PERCENT: 'percent',
  TASKS: 'tasks',
  HOURS: 'hours',
  ITEMS: 'items',
  BOOLEAN: 'boolean'
};

export const goalStatusOptions = [
  { value: GOAL_STATUS.NOT_STARTED, label: 'Sin iniciar' },
  { value: GOAL_STATUS.IN_PROGRESS, label: 'En progreso' },
  { value: GOAL_STATUS.AT_RISK, label: 'En riesgo' },
  { value: GOAL_STATUS.COMPLETED, label: 'Completado' },
  { value: GOAL_STATUS.CANCELLED, label: 'Cancelado' }
];

export const goalCategoryOptions = [
  { value: GOAL_CATEGORIES.CERTIFICATION, label: 'Certificacion' },
  { value: GOAL_CATEGORIES.TECHNICAL_DEBT, label: 'Deuda tecnica' },
  { value: GOAL_CATEGORIES.DELIVERY, label: 'Entrega' },
  { value: GOAL_CATEGORIES.QUALITY, label: 'Calidad' },
  { value: GOAL_CATEGORIES.TRAINING, label: 'Capacitacion' },
  { value: GOAL_CATEGORIES.OTHER, label: 'Otro' }
];

export const goalUnitOptions = [
  { value: GOAL_UNITS.PERCENT, label: 'Porcentaje' },
  { value: GOAL_UNITS.TASKS, label: 'Tareas' },
  { value: GOAL_UNITS.HOURS, label: 'Horas' },
  { value: GOAL_UNITS.ITEMS, label: 'Items' },
  { value: GOAL_UNITS.BOOLEAN, label: 'Si/No' }
];

export const goalStatusColor = {
  [GOAL_STATUS.NOT_STARTED]: 'default',
  [GOAL_STATUS.IN_PROGRESS]: 'processing',
  [GOAL_STATUS.AT_RISK]: 'warning',
  [GOAL_STATUS.COMPLETED]: 'success',
  [GOAL_STATUS.CANCELLED]: 'error'
};

const statusLabelByValue = Object.fromEntries(goalStatusOptions.map((option) => [option.value, option.label]));
const categoryLabelByValue = Object.fromEntries(
  goalCategoryOptions.map((option) => [option.value, option.label])
);
const unitLabelByValue = Object.fromEntries(goalUnitOptions.map((option) => [option.value, option.label]));

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function daysUntil(dateValue, now = new Date()) {
  if (!dateValue) return null;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  const difference = date.getTime() - now.getTime();
  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

export function getGoalStatusLabel(status) {
  return statusLabelByValue[status] ?? status;
}

export function getGoalCategoryLabel(category) {
  return categoryLabelByValue[category] ?? category;
}

export function getGoalUnitLabel(unit) {
  return unitLabelByValue[unit] ?? unit;
}

export function calculateGoalProgress(goal = {}) {
  const currentValue = toFiniteNumber(goal.currentValue);
  const targetValue = toFiniteNumber(goal.targetValue, 100);

  if (goal.unit === GOAL_UNITS.BOOLEAN) {
    return currentValue >= 1 ? 100 : 0;
  }

  if (goal.unit === GOAL_UNITS.PERCENT) {
    return clamp(Math.round(currentValue), 0, 100);
  }

  if (targetValue <= 0) {
    return 0;
  }

  return clamp(Math.round((currentValue / targetValue) * 100), 0, 100);
}

export function deriveGoalStatus(goal = {}, now = new Date()) {
  if (goal.status === GOAL_STATUS.CANCELLED) {
    return GOAL_STATUS.CANCELLED;
  }

  const progress = calculateGoalProgress(goal);
  if (progress >= 100) {
    return GOAL_STATUS.COMPLETED;
  }

  const remainingDays = daysUntil(goal.dueDate, now);
  if (remainingDays !== null && remainingDays <= 7 && progress < 80) {
    return GOAL_STATUS.AT_RISK;
  }

  return progress > 0 ? GOAL_STATUS.IN_PROGRESS : GOAL_STATUS.NOT_STARTED;
}

export function normalizeGoal(goal = {}) {
  const progress = calculateGoalProgress(goal);
  const status = deriveGoalStatus(goal);

  return {
    ...goal,
    currentValue: toFiniteNumber(goal.currentValue),
    targetValue: toFiniteNumber(goal.targetValue, goal.unit === GOAL_UNITS.PERCENT ? 100 : 1),
    weight: toFiniteNumber(goal.weight, 10),
    progress,
    status
  };
}

export function filterGoalsClient(goals = [], filters = {}) {
  const normalizedSearch = String(filters.search ?? '')
    .trim()
    .toLowerCase();

  return goals.filter((goal) => {
    if (filters.employeeId && goal.employeeId !== filters.employeeId) return false;
    if (filters.periodId && goal.periodId !== filters.periodId) return false;
    if (filters.status && goal.status !== filters.status) return false;
    if (filters.category && goal.category !== filters.category) return false;

    if (!normalizedSearch) return true;

    const haystack = `${goal.title} ${goal.description} ${goal.employeeName ?? ''} ${
      goal.categoryLabel ?? ''
    }`.toLowerCase();
    return haystack.includes(normalizedSearch);
  });
}

export function summarizeGoals(goals = []) {
  const activeGoals = goals.filter((goal) => goal.status !== GOAL_STATUS.CANCELLED);
  const total = activeGoals.length;
  const completed = activeGoals.filter((goal) => goal.status === GOAL_STATUS.COMPLETED).length;
  const atRisk = activeGoals.filter((goal) => goal.status === GOAL_STATUS.AT_RISK).length;
  const inProgress = activeGoals.filter((goal) => goal.status === GOAL_STATUS.IN_PROGRESS).length;
  const averageProgress =
    total > 0
      ? Math.round(activeGoals.reduce((sum, goal) => sum + Number(goal.progress ?? 0), 0) / total)
      : 0;

  return {
    total,
    completed,
    atRisk,
    inProgress,
    averageProgress
  };
}

export function toGoalRows(goals = [], { employees = [], periods = [] } = {}) {
  const employeeById = new Map(employees.map((employee) => [employee._id ?? employee.id, employee]));
  const periodById = new Map(periods.map((period) => [period._id ?? period.id, period]));

  return goals.map((goal) => {
    const normalized = normalizeGoal(goal);
    const employee = employeeById.get(normalized.employeeId);
    const period = periodById.get(normalized.periodId);

    return {
      ...normalized,
      key: normalized._id,
      employeeName: employee?.name ?? normalized.employeeName ?? 'Empleado',
      employeePosition: employee?.position ?? normalized.employeePosition ?? '-',
      periodLabel:
        period?.label ??
        normalized.periodLabel ??
        (period ? `${period.year}-${String(period.month).padStart(2, '0')}` : 'Sin periodo'),
      statusLabel: getGoalStatusLabel(normalized.status),
      categoryLabel: getGoalCategoryLabel(normalized.category),
      unitLabel: getGoalUnitLabel(normalized.unit)
    };
  });
}
