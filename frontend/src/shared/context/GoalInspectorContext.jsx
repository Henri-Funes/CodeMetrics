import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useNavigate } from 'react-router-dom';

import { listGoals } from '../api/goals.api.js';
import { toGoalRows } from '../../features/goals/models/goals.model.js';
import {
  readEvaluationFilters,
  readInspectorPanels,
  writeEvaluationFilters,
  writeInspectorPanels
} from '../utils/sessionPersistence.js';

const GoalInspectorContext = createContext(null);

const DEFAULT_EVALUATION_FILTERS = {
  status: undefined,
  periodId: undefined,
  employeeId: undefined,
  search: ''
};

function createPanelId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `panel-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function serializePanels(panels) {
  return panels.map((panel) => ({
    id: panel.id,
    selectedGoalId: panel.selectedGoal?._id ?? null,
    isMinimized: panel.isMinimized,
    position: panel.position,
    zIndex: panel.zIndex
  }));
}

function buildPeerGoals(goal, allRows) {
  return allRows.filter(
    (item) =>
      String(item.employeeId) === String(goal.employeeId) &&
      String(item.periodId) === String(goal.periodId)
  );
}

export function GoalInspectorProvider({ children }) {
  const navigate = useNavigate();
  const [panels, setPanels] = useState([]);
  const zIndexRef = useRef(1100);
  const hydratedRef = useRef(false);

  const persistPanels = useCallback((nextPanels) => {
    writeInspectorPanels(serializePanels(nextPanels));
  }, []);

  const hydratePanels = useCallback(async () => {
    const savedPanels = readInspectorPanels();
    if (!savedPanels.length) {
      hydratedRef.current = true;
      return;
    }

    const allGoals = await listGoals();
    const rows = toGoalRows(allGoals);
    const restoredPanels = savedPanels
      .map((saved) => {
        const selectedGoal = rows.find((goal) => goal._id === saved.selectedGoalId);
        if (!selectedGoal) return null;

        return {
          id: saved.id,
          selectedGoal,
          peerGoals: buildPeerGoals(selectedGoal, rows),
          isMinimized: Boolean(saved.isMinimized),
          position: saved.position ?? { x: null, y: null },
          zIndex: saved.zIndex ?? zIndexRef.current
        };
      })
      .filter(Boolean);

    zIndexRef.current = Math.max(
      1100,
      ...restoredPanels.map((panel) => panel.zIndex ?? 1100),
      zIndexRef.current
    );
    setPanels(restoredPanels);
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    hydratePanels().catch(() => {
      hydratedRef.current = true;
    });
  }, [hydratePanels]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    persistPanels(panels);
  }, [panels, persistPanels]);

  const bringToFront = useCallback((panelId) => {
    zIndexRef.current += 1;
    const nextZIndex = zIndexRef.current;

    setPanels((current) =>
      current.map((panel) =>
        panel.id === panelId ? { ...panel, zIndex: nextZIndex, isMinimized: false } : panel
      )
    );
  }, []);

  const openInspector = useCallback(
    async (goal) => {
      const existingPanel = panels.find((panel) => panel.selectedGoal?._id === goal._id);
      if (existingPanel) {
        bringToFront(existingPanel.id);
        return;
      }

      const allGoals = await listGoals();
      const rows = toGoalRows(allGoals);
      const freshGoal = rows.find((item) => item._id === goal._id) ?? goal;
      const peerGoals = buildPeerGoals(freshGoal, rows);

      zIndexRef.current += 1;
      const stackIndex = panels.length;

      setPanels((current) => [
        ...current,
        {
          id: createPanelId(),
          selectedGoal: freshGoal,
          peerGoals: peerGoals.length > 0 ? peerGoals : [freshGoal],
          isMinimized: false,
          position: { x: null, y: null },
          zIndex: zIndexRef.current,
          stackIndex
        }
      ]);
    },
    [panels, bringToFront]
  );

  const refreshPanels = useCallback(async () => {
    if (!panels.length) return;

    const allGoals = await listGoals();
    const rows = toGoalRows(allGoals);

    setPanels((current) =>
      current
        .map((panel) => {
          const selectedGoal = rows.find((goal) => goal._id === panel.selectedGoal?._id);
          if (!selectedGoal) return null;

          return {
            ...panel,
            selectedGoal,
            peerGoals: buildPeerGoals(selectedGoal, rows)
          };
        })
        .filter(Boolean)
    );
  }, [panels.length]);

  const selectGoal = useCallback((panelId, goal) => {
    setPanels((current) =>
      current.map((panel) =>
        panel.id === panelId
          ? {
              ...panel,
              selectedGoal: goal,
              isMinimized: false
            }
          : panel
      )
    );
  }, []);

  const closeInspector = useCallback((panelId) => {
    setPanels((current) => current.filter((panel) => panel.id !== panelId));
  }, []);

  const minimizeInspector = useCallback((panelId) => {
    setPanels((current) =>
      current.map((panel) => (panel.id === panelId ? { ...panel, isMinimized: true } : panel))
    );
  }, []);

  const expandInspector = useCallback((panelId) => {
    bringToFront(panelId);
  }, [bringToFront]);

  const setPanelPosition = useCallback((panelId, position) => {
    setPanels((current) =>
      current.map((panel) => (panel.id === panelId ? { ...panel, position } : panel))
    );
  }, []);

  const goToEmployeeEvaluation = useCallback(
    (panelId) => {
      const panel = panels.find((item) => item.id === panelId);
      if (!panel?.selectedGoal) return;

      const navigation = {
        ...(readEvaluationFilters() ?? DEFAULT_EVALUATION_FILTERS),
        employeeId: panel.selectedGoal.employeeId,
        periodId: panel.selectedGoal.periodId ?? undefined
      };

      writeEvaluationFilters(navigation);
      minimizeInspector(panelId);
      navigate('/admin/evaluations');
    },
    [navigate, panels, minimizeInspector]
  );

  const value = useMemo(
    () => ({
      panels,
      openInspector,
      refreshPanels,
      selectGoal,
      closeInspector,
      minimizeInspector,
      expandInspector,
      setPanelPosition,
      goToEmployeeEvaluation,
      bringToFront
    }),
    [
      panels,
      openInspector,
      refreshPanels,
      selectGoal,
      closeInspector,
      minimizeInspector,
      expandInspector,
      setPanelPosition,
      goToEmployeeEvaluation,
      bringToFront
    ]
  );

  return <GoalInspectorContext.Provider value={value}>{children}</GoalInspectorContext.Provider>;
}

export function useGoalInspector() {
  const context = useContext(GoalInspectorContext);

  if (!context) {
    throw new Error('useGoalInspector debe usarse dentro de GoalInspectorProvider.');
  }

  return context;
}
