const STORAGE_KEY = 'codemetrics.goals.v1';

let memoryGoals = [];

const demoTemplates = [
  {
    title: 'Obtener certificacion cloud',
    description: 'Completar una certificacion tecnica alineada al rol del colaborador.',
    category: 'certification',
    unit: 'boolean',
    targetValue: 1,
    weight: 25
  },
  {
    title: 'Reducir deuda tecnica del modulo',
    description: 'Resolver hallazgos de deuda tecnica priorizados por el lider del equipo.',
    category: 'technical_debt',
    unit: 'percent',
    targetValue: 100,
    weight: 30
  },
  {
    title: 'Finalizar entregables del sprint',
    description: 'Cerrar entregables funcionales dentro de la fecha comprometida.',
    category: 'delivery',
    unit: 'tasks',
    targetValue: 10,
    weight: 30
  },
  {
    title: 'Mejorar calidad de entregas',
    description: 'Incrementar cobertura de pruebas y reducir retrabajo reportado por QA.',
    category: 'quality',
    unit: 'percent',
    targetValue: 100,
    weight: 15
  }
];

function canUseLocalStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function readGoals() {
  if (!canUseLocalStorage()) {
    return memoryGoals;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : [];
  } catch (_error) {
    return [];
  }
}

function writeGoals(goals) {
  memoryGoals = goals;

  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

function createGoalId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `goal-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getEmployeeId(employee) {
  return employee?._id ?? employee?.id ?? null;
}

function getPeriodLabel(period) {
  if (!period) return 'Periodo demo';
  return period.label ?? `${period.year}-${String(period.month).padStart(2, '0')}`;
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function buildDemoGoal(template, employee, period, assignedBy, index, templateIndex) {
  const employeeId = getEmployeeId(employee);
  const progressSeed = (index * 17 + templateIndex * 23) % 100;
  const currentValue =
    template.unit === 'boolean'
      ? progressSeed > 72
        ? 1
        : 0
      : template.unit === 'tasks'
        ? Math.min(template.targetValue, Math.round((progressSeed / 100) * template.targetValue))
        : progressSeed;

  return {
    _id: createGoalId(),
    employeeId,
    assignedBy,
    periodId: period?._id ?? null,
    periodLabel: getPeriodLabel(period),
    title: template.title,
    description: template.description,
    category: template.category,
    unit: template.unit,
    targetValue: template.targetValue,
    currentValue,
    weight: template.weight,
    dueDate: addDays(10 + templateIndex * 9 - (index % 4) * 4),
    status: currentValue > 0 ? 'in_progress' : 'not_started',
    evidenceNote: currentValue > 0 ? 'Avance demo generado para presentacion academica.' : '',
    completedAt: currentValue >= template.targetValue ? new Date().toISOString() : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function matchesFilters(goal, params = {}) {
  if (params.employeeId && goal.employeeId !== params.employeeId) return false;
  if (params.periodId && goal.periodId !== params.periodId) return false;
  if (params.status && goal.status !== params.status) return false;
  if (params.category && goal.category !== params.category) return false;
  return true;
}

function ensureGoalExists(goalId, goals) {
  const goal = goals.find((item) => item._id === goalId);

  if (!goal) {
    throw new Error('Objetivo no encontrado.');
  }

  return goal;
}

export async function ensureDemoGoals(employees = [], periods = [], assignedBy = null) {
  const currentGoals = readGoals();
  const activeEmployees = employees.filter((employee) => {
    const employeeId = getEmployeeId(employee);
    return employeeId && (employee.role === 'employee' || !employee.role) && employee.isActive !== false;
  });
  const primaryPeriod = periods[0] ?? null;
  const existingEmployeeIds = new Set(currentGoals.map((goal) => goal.employeeId));
  const missingEmployees = activeEmployees.filter(
    (employee) => !existingEmployeeIds.has(getEmployeeId(employee))
  );

  if (missingEmployees.length === 0) {
    return currentGoals;
  }

  const demoGoals = missingEmployees.flatMap((employee, index) =>
    demoTemplates.slice(0, 3).map((template, templateIndex) =>
      buildDemoGoal(template, employee, primaryPeriod, assignedBy, index, templateIndex)
    )
  );
  const nextGoals = [...currentGoals, ...demoGoals];
  writeGoals(nextGoals);
  return nextGoals;
}

export async function listGoals(params = {}) {
  return readGoals()
    .filter((goal) => matchesFilters(goal, params))
    .sort((a, b) => String(a.dueDate ?? '').localeCompare(String(b.dueDate ?? '')));
}

export async function createGoal(payload) {
  if (!payload?.employeeId) {
    throw new Error('Selecciona un empleado para asignar el objetivo.');
  }

  const goals = readGoals();
  const now = new Date().toISOString();
  const goal = {
    _id: createGoalId(),
    employeeId: payload.employeeId,
    assignedBy: payload.assignedBy ?? null,
    periodId: payload.periodId ?? null,
    periodLabel: payload.periodLabel ?? '',
    title: payload.title,
    description: payload.description,
    category: payload.category,
    unit: payload.unit,
    targetValue: Number(payload.targetValue ?? 100),
    currentValue: Number(payload.currentValue ?? 0),
    weight: Number(payload.weight ?? 10),
    dueDate: payload.dueDate ?? null,
    status: payload.status ?? 'not_started',
    evidenceNote: payload.evidenceNote ?? '',
    completedAt: null,
    createdAt: now,
    updatedAt: now
  };

  writeGoals([goal, ...goals]);
  return goal;
}

export async function updateGoal(goalId, payload) {
  const goals = readGoals();
  const goal = ensureGoalExists(goalId, goals);
  const nextGoal = {
    ...goal,
    ...payload,
    targetValue: Number(payload.targetValue ?? goal.targetValue),
    currentValue: Number(payload.currentValue ?? goal.currentValue),
    weight: Number(payload.weight ?? goal.weight),
    updatedAt: new Date().toISOString()
  };
  const nextGoals = goals.map((item) => (item._id === goalId ? nextGoal : item));
  writeGoals(nextGoals);
  return nextGoal;
}

export async function updateGoalProgress(goalId, payload) {
  const goals = readGoals();
  const goal = ensureGoalExists(goalId, goals);
  const nextGoal = {
    ...goal,
    currentValue: Number(payload.currentValue ?? goal.currentValue),
    evidenceNote: payload.evidenceNote ?? goal.evidenceNote ?? '',
    updatedAt: new Date().toISOString()
  };
  const nextGoals = goals.map((item) => (item._id === goalId ? nextGoal : item));
  writeGoals(nextGoals);
  return nextGoal;
}

export async function cancelGoal(goalId) {
  return updateGoal(goalId, {
    status: 'cancelled'
  });
}
