const SESSION_USER_KEY = 'codemetrics.session.userId';
const SESSION_INSPECTOR_KEY = 'codemetrics.session.inspectorPanels';
const SESSION_EVALUATION_FILTERS_KEY = 'codemetrics.session.evaluationFilters';
const SESSION_REDEMPTION_NOTIFICATIONS_KEY = 'codemetrics.session.redemptionNotifications';

function readJson(key, fallback = null) {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch (_error) {
    // Ignore quota or privacy mode errors.
  }
}

function removeKey(key) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(key);
}

export function readSessionUserId() {
  return readJson(SESSION_USER_KEY, null);
}

export function writeSessionUserId(userId) {
  if (!userId) {
    removeKey(SESSION_USER_KEY);
    return;
  }

  writeJson(SESSION_USER_KEY, userId);
}

export function readInspectorPanels() {
  return readJson(SESSION_INSPECTOR_KEY, []);
}

export function writeInspectorPanels(panels) {
  if (!panels?.length) {
    removeKey(SESSION_INSPECTOR_KEY);
    return;
  }

  writeJson(SESSION_INSPECTOR_KEY, panels);
}

const DEFAULT_EVALUATION_FILTERS = {
  status: undefined,
  periodId: undefined,
  employeeId: undefined,
  search: ''
};

export function readEvaluationFilters() {
  const saved = readJson(SESSION_EVALUATION_FILTERS_KEY, null);
  if (!saved || typeof saved !== 'object') return null;

  return {
    ...DEFAULT_EVALUATION_FILTERS,
    ...saved
  };
}

export function writeEvaluationFilters(filters) {
  if (!filters) {
    removeKey(SESSION_EVALUATION_FILTERS_KEY);
    return;
  }

  writeJson(SESSION_EVALUATION_FILTERS_KEY, {
    ...DEFAULT_EVALUATION_FILTERS,
    ...filters
  });
}

const SESSION_GOALS_FILTERS_KEY = 'codemetrics.session.goalsFilters';

const DEFAULT_GOALS_FILTERS = {
  employeeId: undefined,
  periodId: undefined,
  status: undefined,
  category: undefined,
  search: ''
};

export function readGoalsFilters() {
  const saved = readJson(SESSION_GOALS_FILTERS_KEY, null);
  if (!saved || typeof saved !== 'object') return null;

  return {
    ...DEFAULT_GOALS_FILTERS,
    ...saved
  };
}

export function writeGoalsFilters(filters) {
  if (!filters) {
    removeKey(SESSION_GOALS_FILTERS_KEY);
    return;
  }

  writeJson(SESSION_GOALS_FILTERS_KEY, {
    ...DEFAULT_GOALS_FILTERS,
    ...filters
  });
}

function readRedemptionNotificationState() {
  const saved = readJson(SESSION_REDEMPTION_NOTIFICATIONS_KEY, null);
  if (!saved || typeof saved !== 'object') return {};

  return saved;
}

function writeRedemptionNotificationState(state) {
  if (!state || Object.keys(state).length === 0) {
    removeKey(SESSION_REDEMPTION_NOTIFICATIONS_KEY);
    return;
  }

  writeJson(SESSION_REDEMPTION_NOTIFICATIONS_KEY, state);
}

export function hasSeenRedemptionNotification(employeeId, redemptionId, status) {
  if (!employeeId || !redemptionId || !status) {
    return false;
  }

  const state = readRedemptionNotificationState();
  return state?.[employeeId]?.[redemptionId] === status;
}

export function markRedemptionNotificationSeen(employeeId, redemptionId, status) {
  if (!employeeId || !redemptionId || !status) {
    return;
  }

  const state = readRedemptionNotificationState();
  state[employeeId] = {
    ...(state[employeeId] ?? {}),
    [redemptionId]: status
  };
  writeRedemptionNotificationState(state);
}
